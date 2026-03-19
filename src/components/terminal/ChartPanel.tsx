'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import { useChart } from '@/hooks/useChart';
import { useTradeOverlays } from '@/hooks/useTradeOverlays';

export function ChartPanel() {
  const selectedSymbol    = useTerminalStore((s) => s.selectedSymbol);
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const setCandlesLoading = useTerminalStore((s) => s.setCandlesLoading);

  // Latest tick for this symbol — drives both candle patching and overlay PnL updates
  const latestTick = useTerminalStore((s) => s.livePrices[selectedSymbol] ?? null);

  // Select raw positions array (stable ref when unchanged), then derive
  // per-symbol slice with useMemo to avoid an infinite useSyncExternalStore loop.
  const allPositions    = useTerminalStore((s) => s.positions);
  const symbolPositions = useMemo(
    () => allPositions.filter((p) => p.symbol === selectedSymbol),
    [allPositions, selectedSymbol],
  );

  const { containerRef, chartRef, seriesRef, isLoading, error, candleCount, lastTickTime } =
    useChart(selectedSymbol, selectedTimeframe, latestTick);

  // Ref for the drag-hint overlay element — written directly by useTradeOverlays
  // without going through React state, keeping tick-driven renders clean.
  const hintRef = useRef<HTMLDivElement>(null);

  // Wire trade overlays + SL/TP drag interaction
  useTradeOverlays(
    chartRef,
    seriesRef,
    containerRef,
    hintRef,
    symbolPositions,
    latestTick?.markPrice ?? 0,
  );

  // Keep store in sync with loading state
  useEffect(() => {
    setCandlesLoading(isLoading);
  }, [isLoading, setCandlesLoading]);

  // isLive: true for 5 s after each tick, then auto-expires
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    if (lastTickTime === null) { setIsLive(false); return; }
    setIsLive(true);
    const id = setTimeout(() => setIsLive(false), 5_000);
    return () => clearTimeout(id);
  }, [lastTickTime]);

  const hasPositions = symbolPositions.length > 0;

  return (
    <div className="flex-1 relative bg-t-bg overflow-hidden min-h-0">
      {/* chart canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* top-left: symbol + timeframe watermark */}
      <div className="absolute top-3 left-4 flex items-baseline gap-2 pointer-events-none z-10 select-none">
        <span className="text-sm font-mono font-semibold text-t-text opacity-25">
          {selectedSymbol}
        </span>
        <span className="text-xs font-mono text-t-muted opacity-25 uppercase">
          {selectedTimeframe}
        </span>
      </div>

      {/* top-right: LIVE indicator + position count badge */}
      <div className="absolute top-3 right-4 flex items-center gap-3 pointer-events-none z-10">
        {hasPositions && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-t-cyan select-none">
              {symbolPositions.length} position{symbolPositions.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-t-cyan animate-pulse" />
            <span className="text-[10px] font-mono text-t-cyan uppercase tracking-[0.15em] select-none">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Drag hint banner — written directly by useTradeOverlays (no React state) */}
      <div
        ref={hintRef}
        style={{ display: 'none' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none
                   px-3 py-1.5 rounded border border-t-cyan/30 bg-t-panel/90 backdrop-blur-sm
                   text-[11px] font-mono text-t-cyan whitespace-nowrap"
      />

      {/* loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-t-bg/70 z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-5 h-5 border-2 border-t-border rounded-full animate-spin"
              style={{ borderTopColor: '#22d3ee' }}
            />
            <span className="text-xs font-mono text-t-sub">
              Loading {selectedSymbol} {selectedTimeframe}…
            </span>
          </div>
        </div>
      )}

      {/* error overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-t-panel border border-t-border max-w-xs text-center">
            <span className="text-xs font-mono text-t-red uppercase tracking-wider">
              Failed to load candles
            </span>
            <span className="text-xs font-mono text-t-sub leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      {/* bottom-right: candle count */}
      {candleCount > 0 && !isLoading && (
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-t-muted opacity-30 pointer-events-none z-10 select-none">
          {candleCount} candles
        </div>
      )}
    </div>
  );
}
