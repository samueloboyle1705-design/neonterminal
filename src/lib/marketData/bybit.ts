import type { Candle, ConnectionStatus, MarketTick, Timeframe } from './types';
import type { MarketDataProvider } from './provider';
import type { BybitRawTicker, BybitTickerEnvelope } from './normalize';
import { fetchCandles } from './candles';
import { normalizeTicker } from './normalize';
import { BybitStream } from './stream';

/**
 * Bybit implementation of MarketDataProvider.
 *
 * Each instance owns one BybitStream (one WebSocket connection).
 * All ticker subscriptions on the same BybitProvider instance share
 * that single connection; no duplicate sockets are opened.
 *
 * Usage:
 *   const provider = new BybitProvider();
 *   const candles  = await provider.getCandles('BTCUSDT', '15', 200);
 *   const unsub    = provider.subscribeTicker(['BTCUSDT', 'ETHUSDT'], tick => console.log(tick));
 *   // later:
 *   unsub();
 *   provider.destroy();
 */
export class BybitProvider implements MarketDataProvider {
  private readonly stream: BybitStream;

  constructor() {
    this.stream = new BybitStream();
  }

  // -------------------------------------------------------------------------
  // REST — candles
  // -------------------------------------------------------------------------

  getCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]> {
    return fetchCandles(symbol, timeframe, limit);
  }

  // -------------------------------------------------------------------------
  // WebSocket — tickers
  // -------------------------------------------------------------------------

  subscribeTicker(symbols: string[], onTick: (tick: MarketTick) => void): () => void {
    if (symbols.length === 0) return () => undefined;

    // Maintain per-topic state so delta updates can be merged into the last
    // known snapshot before being forwarded to callers.
    const snapshots = new Map<string, BybitRawTicker>();

    const unsubscribers = symbols.map((symbol) => {
      const topic = `tickers.${symbol}`;

      return this.stream.subscribe(topic, (envelope) => {
        const env = envelope as unknown as BybitTickerEnvelope;
        const incoming = env.data as BybitRawTicker;

        if (!incoming?.symbol) return;

        let merged: BybitRawTicker;

        if (env.type === 'snapshot') {
          // Full snapshot — replace stored state.
          merged = incoming;
          snapshots.set(symbol, { ...incoming });
        } else {
          // Delta — merge into snapshot so callers always get full data.
          const prev = snapshots.get(symbol);
          if (!prev) {
            // Haven't received a snapshot yet; treat delta as-is.
            merged = incoming;
          } else {
            merged = { ...prev, ...incoming };
            snapshots.set(symbol, merged);
          }
        }

        onTick(normalizeTicker(merged, env.ts));
      });
    });

    // Return a single cleanup function that unsubscribes all topics.
    return () => {
      for (const unsub of unsubscribers) {
        unsub();
      }
      snapshots.clear();
    };
  }

  // -------------------------------------------------------------------------
  // Status / lifecycle
  // -------------------------------------------------------------------------

  getConnectionStatus(): ConnectionStatus {
    return this.stream.getStatus();
  }

  /**
   * Register a callback for WebSocket connection status changes.
   * Returns an unregister function.
   */
  onConnectionStatusChange(listener: (s: ConnectionStatus) => void): () => void {
    return this.stream.onStatusChange(listener);
  }

  /** Close the WebSocket and free all resources. */
  destroy(): void {
    this.stream.destroy();
  }
}

// ---------------------------------------------------------------------------
// Singleton — shared across the app so there is always exactly one socket.
// ---------------------------------------------------------------------------

let _instance: BybitProvider | null = null;

/**
 * Returns the app-wide singleton BybitProvider.
 * Creates it on first call; subsequent calls return the same instance.
 * Call `destroyBybitProvider()` if you need to fully reset (e.g. in tests).
 */
export function getBybitProvider(): BybitProvider {
  if (!_instance) {
    _instance = new BybitProvider();
  }
  return _instance;
}

/** Destroy the singleton and clear the reference. */
export function destroyBybitProvider(): void {
  _instance?.destroy();
  _instance = null;
}
