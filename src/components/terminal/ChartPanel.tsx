'use client';

import { useEffect } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import { useChart } from '@/hooks/useChart';

export function ChartPanel() {
  const selectedSymbol    = useTerminalStore((s) => s.selectedSymbol);
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const setCandlesLoading = useTerminalStore((s) => s.setCandlesLoading);

  // Read the latest tick for the selected symbol directly from the store.
  // StoreStreamBridge already feeds setLivePrice on every WS tick, so no
  // extra subscription is needed — we just observe the existing slice.
  const latestTick = useTerminalStore((s) => s.livePrices[selectedSymbol] ?? null);

  const { containerRef, isLoading, error, candleCount, lastTickTime } = useChart(
    selectedSymbol,
    selectedTimeframe,
    latestTick,
  );

  // Keep the store's candlesLoading flag in sync so other panels
  // (e.g. a future status bar) can react to load state.
  useEffect(() => {
    setCandlesLoading(isLoading);
  }, [isLoading, setCandlesLoading]);

  // Whether we've received a live tick in the last 5 seconds.
  const isLive = lastTickTime !== null && Date.now() - lastTickTime < 5_000;

  return (
    <div className="flex-1 relative bg-t-bg overflow-hidden min-h-0">
      {/* ── Chart container ─────────────────────────────────────────────── */}
      {/* lightweight-charts renders a <canvas> directly into this div.    */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* ── Top-left watermark: symbol + timeframe ───────────────────────── */}
      <div className="absolute top-3 left-4 flex items-baseline gap-2 pointer-events-none z-10">
        <span className="text-sm font-mono font-semibold text-t-text opacity-40 select-none">
          {selectedSymbol}
        </span>
        <span className="text-xs font-mono text-t-muted opacity-40 uppercase select-none">
          {selectedTimeframe}
        </span>
      </div>

      {/* ── Top-right: LIVE indicator ────────────────────────────────────── */}
      {/* Visible once the first live tick after data-load has been applied. */}
      {isLive && (
        <div className="absolute top-3 right-4 flex items-center gap-1.5 pointer-events-none z-10">
          <span className="block w-1.5 h-1.5 rounded-full bg-t-green animate-pulse" />
          <span className="text-xs font-mono text-t-muted uppercase tracking-widest select-none">
            Live
          </span>
        </div>
      )}

      {/* ── Loading overlay ──────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-t-bg/60 z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-t-border border-t-green rounded-full animate-spin" />
            <span className="text-xs font-mono text-t-muted">
              Loading {selectedSymbol} {selectedTimeframe}…
            </span>
          </div>
        </div>
      )}

      {/* ── Error overlay ────────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-2 max-w-xs text-center">
            <span className="text-xs font-mono text-t-red uppercase tracking-wider">
              Failed to load candles
            </span>
            <span className="text-xs font-mono text-t-muted">{error}</span>
          </div>
        </div>
      )}

      {/* ── Bottom-right: candle count ───────────────────────────────────── */}
      {candleCount > 0 && !isLoading && (
        <div className="absolute bottom-3 right-4 text-xs font-mono text-t-muted opacity-40 pointer-events-none z-10 select-none">
          {candleCount} candles
        </div>
      )}
    </div>
  );
}
