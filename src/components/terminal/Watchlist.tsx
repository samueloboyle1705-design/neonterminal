'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import type { SupportedSymbol } from '@/lib/marketData';

function fmtPrice(n: number): string {
  // Use enough decimals for small-cap prices (SOL), not too many for BTC
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 10) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(2)}%`;
}

// Strip "USDT" suffix for compact display
function shortSym(sym: string): string {
  return sym.replace('USDT', '');
}

export function Watchlist() {
  const watchlist = useTerminalStore((s) => s.watchlist);
  const livePrices = useTerminalStore((s) => s.livePrices);
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTerminalStore((s) => s.setSelectedSymbol);

  return (
    <aside className="w-48 flex flex-col border-r border-t-border bg-t-panel shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-t-border">
        <span className="text-xs font-mono text-t-muted uppercase tracking-widest">
          Watchlist
        </span>
      </div>

      {/* Symbol rows */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((sym) => {
          const tick = livePrices[sym];
          const isSelected = sym === selectedSymbol;
          const pct = tick?.priceChangePct24h ?? 0;
          const priceUp = pct >= 0;

          return (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym as SupportedSymbol)}
              className={[
                'w-full flex items-center justify-between px-3 py-2.5 text-left',
                'border-l-2 transition-colors duration-100',
                'hover:bg-t-surface',
                isSelected
                  ? 'bg-t-surface border-t-green'
                  : 'border-transparent',
              ].join(' ')}
            >
              {/* Left: symbol name */}
              <div className="flex flex-col gap-0.5">
                <span
                  className={`text-xs font-mono font-semibold ${
                    isSelected ? 'text-t-green' : 'text-t-text'
                  }`}
                >
                  {shortSym(sym)}
                </span>
                <span className="text-xs font-mono text-t-muted">USDT·PERP</span>
              </div>

              {/* Right: price + pct */}
              <div className="flex flex-col items-end gap-0.5">
                {tick ? (
                  <>
                    <span className="text-xs font-mono text-t-text tabular-nums">
                      {fmtPrice(tick.lastPrice)}
                    </span>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        priceUp ? 'text-t-green' : 'text-t-red'
                      }`}
                    >
                      {fmtPct(pct)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-t-muted">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer: funding rate or volume could go here later */}
      <div className="px-3 py-2 border-t border-t-border">
        <span className="text-xs font-mono text-t-muted">
          {watchlist.length} symbols
        </span>
      </div>
    </aside>
  );
}
