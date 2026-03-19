import type { ConnectionStatus } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear';
/** Bybit drops idle connections after 30 s; ping every 20 s to keep alive. */
const PING_INTERVAL_MS = 20_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_JITTER_MS = 500;

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type TopicCallback = (envelope: BybitWsEnvelope) => void;

interface BybitWsMessage {
  op?: string;
  topic?: string;
  type?: 'snapshot' | 'delta';
  data?: unknown;
  ts?: number;
  success?: boolean;
  ret_msg?: string;
}

export interface BybitWsEnvelope {
  data: unknown;
  ts: number;
  type: 'snapshot' | 'delta';
}

// ---------------------------------------------------------------------------
// BybitStream
// ---------------------------------------------------------------------------

/**
 * Managed WebSocket connection to Bybit's public linear stream.
 *
 * Features:
 * - Single underlying WebSocket shared across all subscribers.
 * - Duplicate-subscription prevention: one WS `subscribe` per topic.
 * - Automatic WS `unsubscribe` when the last subscriber leaves a topic.
 * - Exponential-backoff reconnection with jitter.
 * - Heartbeat pings every 20 s.
 * - Re-subscribes all active topics after reconnection.
 * - SSR-safe (no-ops when `window` is undefined).
 */
export class BybitStream {
  private ws: WebSocket | null = null;
  /** topic → set of callbacks */
  private subscriptions = new Map<string, Set<TopicCallback>>();
  private status: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<(s: ConnectionStatus) => void>();
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private destroyed = false;

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /** Open the WebSocket connection (idempotent). */
  connect(): void {
    if (typeof window === 'undefined') return; // SSR guard
    if (this.destroyed) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;

    this.setStatus('connecting');
    const ws = new WebSocket(BYBIT_WS_URL);
    this.ws = ws;

    ws.onopen = this.handleOpen;
    ws.onmessage = this.handleMessage;
    ws.onerror = this.handleError;
    ws.onclose = this.handleClose;
  }

  /**
   * Subscribe `callback` to `topic` (e.g. `"tickers.BTCUSDT"`).
   * Returns an unsubscribe function.  Safe to call multiple times with
   * the same topic — the WS subscription is only sent once.
   */
  subscribe(topic: string, callback: TopicCallback): () => void {
    if (this.destroyed) return () => undefined;

    let cbs = this.subscriptions.get(topic);
    const isFirstSubscriber = !cbs || cbs.size === 0;

    if (!cbs) {
      cbs = new Set();
      this.subscriptions.set(topic, cbs);
    }
    cbs.add(callback);

    // Send WS subscribe only when there was no prior subscriber.
    if (isFirstSubscriber) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendJson({ op: 'subscribe', args: [topic] });
      } else {
        // Connection will re-subscribe all topics on open.
        this.connect();
      }
    }

    return () => this.removeSubscriber(topic, callback);
  }

  /** Current transport status. */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /** Register a listener for status changes. Returns an unregister fn. */
  onStatusChange(listener: (s: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /** Close connection, cancel timers, drop all subscriptions. */
  destroy(): void {
    this.destroyed = true;
    this.clearPing();
    this.clearReconnect();
    if (this.ws) {
      // Remove handlers before closing to avoid triggering reconnect logic.
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.statusListeners.clear();
    this.setStatus('disconnected');
  }

  // -------------------------------------------------------------------------
  // WebSocket event handlers
  // -------------------------------------------------------------------------

  private handleOpen = (): void => {
    this.reconnectAttempt = 0;
    this.setStatus('connected');
    this.startPing();

    // Re-subscribe every active topic (needed after a reconnect).
    const topics = Array.from(this.subscriptions.keys());
    if (topics.length > 0) {
      this.sendJson({ op: 'subscribe', args: topics });
    }
  };

  private handleMessage = (event: MessageEvent): void => {
    let msg: BybitWsMessage;
    try {
      msg = JSON.parse(event.data as string) as BybitWsMessage;
    } catch {
      return;
    }

    // Ignore pong / subscription-ack messages.
    if (msg.op === 'pong' || msg.ret_msg === 'pong') return;
    if (msg.op === 'subscribe' || msg.success !== undefined) return;

    if (msg.topic && msg.data !== undefined) {
      const cbs = this.subscriptions.get(msg.topic);
      if (!cbs || cbs.size === 0) return;

      const envelope: BybitWsEnvelope = {
        data: msg.data,
        ts: msg.ts ?? Date.now(),
        type: msg.type ?? 'snapshot',
      };

      for (const cb of cbs) {
        cb(envelope);
      }
    }
  };

  private handleError = (): void => {
    this.setStatus('error');
    // onclose fires after onerror; reconnect is scheduled there.
  };

  private handleClose = (): void => {
    this.clearPing();
    if (this.destroyed) return;
    this.setStatus('disconnected');
    this.scheduleReconnect();
  };

  // -------------------------------------------------------------------------
  // Reconnection
  // -------------------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.destroyed) return;
    this.clearReconnect();

    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempt +
        Math.random() * RECONNECT_JITTER_MS,
      RECONNECT_MAX_MS,
    );
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // -------------------------------------------------------------------------
  // Heartbeat
  // -------------------------------------------------------------------------

  private startPing(): void {
    this.clearPing();
    this.pingTimer = setInterval(() => {
      this.sendJson({ op: 'ping' });
    }, PING_INTERVAL_MS);
  }

  private clearPing(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  // -------------------------------------------------------------------------
  // Subscriber management
  // -------------------------------------------------------------------------

  private removeSubscriber(topic: string, callback: TopicCallback): void {
    const cbs = this.subscriptions.get(topic);
    if (!cbs) return;

    cbs.delete(callback);

    if (cbs.size === 0) {
      this.subscriptions.delete(topic);
      // Tell Bybit we no longer need this topic.
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendJson({ op: 'unsubscribe', args: [topic] });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private sendJson(payload: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private setStatus(next: ConnectionStatus): void {
    if (this.status === next) return;
    this.status = next;
    for (const listener of this.statusListeners) {
      listener(next);
    }
  }
}
