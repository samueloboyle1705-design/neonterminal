'use client';

/**
 * StoreStreamBridge
 *
 * Invisible component that subscribes to the live Bybit ticker stream and
 * writes updates into the terminal store.  Render it once at the top of the
 * terminal component tree.  All panels then read from the store instead of
 * subscribing to the stream directly.
 */

import { useEffect } from 'react';
import { useTickerStream } from '@/lib/marketData/hooks';
import { SUPPORTED_SYMBOLS } from '@/lib/marketData';
import { useTerminalStore } from '@/stores/terminal-store';

export function StoreStreamBridge() {
  const { ticks, status } = useTickerStream(SUPPORTED_SYMBOLS);
  const setLivePrice = useTerminalStore((s) => s.setLivePrice);
  const setConnectionStatus = useTerminalStore((s) => s.setConnectionStatus);

  useEffect(() => {
    setConnectionStatus(status);
  }, [status, setConnectionStatus]);

  useEffect(() => {
    for (const tick of Object.values(ticks)) {
      setLivePrice(tick);
    }
  }, [ticks, setLivePrice]);

  return null;
}
