'use client';

import { useTerminalStore } from '@/stores/terminal-store';

/**
 * ChartPanel — center stage for the chart.
 *
 * Phase 1: layout shell + placeholder grid.
 * Phase 2: mount lightweight-charts here.
 */
export function ChartPanel() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const candlesLoading = useTerminalStore((s) => s.candlesLoading);
  const candles = useTerminalStore((s) => s.candles);

  return (
    <div className="flex-1 relative bg-t-bg overflow-hidden min-h-0">
      {/* Background rule grid — gives a chart-like feel before data loads */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Horizontal rules */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${((i + 1) / 9) * 100}%`}
            x2="100%"
            y2={`${((i + 1) / 9) * 100}%`}
            stroke="#1c2638"
            strokeWidth="1"
          />
        ))}
        {/* Vertical rules */}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={`${((i + 1) / 7) * 100}%`}
            y1="0"
            x2={`${((i + 1) / 7) * 100}%`}
            y2="100%"
            stroke="#1c2638"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Symbol + timeframe watermark — top-left */}
      <div className="absolute top-3 left-4 flex items-baseline gap-2 pointer-events-none">
        <span className="text-lg font-mono font-semibold text-t-text opacity-60">
          {selectedSymbol}
        </span>
        <span className="text-xs font-mono text-t-muted uppercase">{selectedTimeframe}</span>
      </div>

      {/* Center placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {candlesLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-t-border border-t-green rounded-full animate-spin" />
            <span className="text-xs font-mono text-t-muted">Loading candles…</span>
          </div>
        ) : candles.length === 0 ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-t-muted uppercase tracking-widest">
              Chart
            </span>
            <span className="text-xs font-mono text-t-muted opacity-50">
              Lightweight Charts renders here
            </span>
          </div>
        ) : null}
      </div>

      {/* Candle count badge — bottom-left, shows store is wired */}
      {candles.length > 0 && (
        <div className="absolute bottom-3 left-4 text-xs font-mono text-t-muted pointer-events-none">
          {candles.length} candles loaded
        </div>
      )}
    </div>
  );
}
