'use client';

/**
 * React hooks for live Bybit ticker data.
 *
 * Both hooks share the app-wide singleton BybitProvider (and therefore the
 * same underlying WebSocket).  Subscribing to the same symbol from two
 * different components never opens a second connection or sends a duplicate
 * WS subscribe frame.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ConnectionStatus, MarketTick } from './types';
import { getBybitProvider } from './bybit';

// ---------------------------------------------------------------------------
// useTicker — single symbol
// ---------------------------------------------------------------------------

/**
 * Subscribe to live ticker updates for one symbol.
 *
 * Ideal for chart headers / selected-symbol panels that only care about one
 * instrument at a time.  Switching `symbol` (e.g. user changes chart) will
 * unsubscribe the old topic and subscribe the new one automatically.
 *
 * @example
 *   const { tick, status } = useTicker('BTCUSDT');
 */
export function useTicker(symbol: string): {
  tick: MarketTick | null;
  status: ConnectionStatus;
} {
  const [tick, setTick] = useState<MarketTick | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    typeof window === 'undefined' ? 'disconnected' : getBybitProvider().getConnectionStatus(),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const provider = getBybitProvider();

    // Reset tick when symbol changes so stale data is never shown.
    setTick(null);
    setStatus(provider.getConnectionStatus());

    const unsubStatus = provider.onConnectionStatusChange(setStatus);
    const unsubTicker = provider.subscribeTicker([symbol], setTick);

    return () => {
      unsubTicker();
      unsubStatus();
    };
  }, [symbol]);

  return { tick, status };
}

// ---------------------------------------------------------------------------
// useTickerStream — multiple symbols
// ---------------------------------------------------------------------------

/**
 * Subscribe to live ticker updates for several symbols simultaneously.
 *
 * Ideal for watchlist panels.  Each symbol gets its own WS topic; all share
 * the single underlying WebSocket.  `ticks` is keyed by symbol name and
 * updated incrementally — only the changed symbol's entry is replaced.
 *
 * Pass a stable reference (constant array or `useMemo`) to avoid
 * unnecessary re-subscriptions.
 *
 * @example
 *   const { ticks, status } = useTickerStream(SUPPORTED_SYMBOLS);
 *   ticks['BTCUSDT']?.lastPrice
 */
export function useTickerStream(symbols: readonly string[]): {
  ticks: Record<string, MarketTick>;
  status: ConnectionStatus;
} {
  const [ticks, setTicks] = useState<Record<string, MarketTick>>({});
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    typeof window === 'undefined' ? 'disconnected' : getBybitProvider().getConnectionStatus(),
  );

  // Derive a stable cache key so the effect only re-runs when the symbol
  // list actually changes, not just because the array reference changed.
  const symbolsKey = [...symbols].sort().join(',');

  // Functional update ensures each incoming tick merges into latest state
  // without capturing a stale closure over the previous `ticks` object.
  const onTick = useCallback((tick: MarketTick) => {
    setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const provider = getBybitProvider();

    setTicks({});
    setStatus(provider.getConnectionStatus());

    const symbolList = symbolsKey.split(',').filter(Boolean);

    const unsubStatus = provider.onConnectionStatusChange(setStatus);
    const unsubTicker = provider.subscribeTicker(symbolList, onTick);

    return () => {
      unsubTicker();
      unsubStatus();
    };
    // symbolsKey captures the sorted, joined list; onTick is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, onTick]);

  return { ticks, status };
}
