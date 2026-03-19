'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import type { SupportedSymbol } from '@/lib/marketData';

function fmtPrice(n: number): string {
  if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 100) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(2)}%`;
}

function shortSym(sym: string): string {
  return sym.replace('USDT', '');
}

export function Watchlist() {
  const watchlist = useTerminalStore((s) => s.watchlist);
  const livePrices = useTerminalStore((s) => s.livePrices);
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTerminalStore((s) => s.setSelectedSymbol);

  return (
    <aside className="w-44 flex flex-col border-r border-t-border bg-t-panel shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-t-border">
        <span className="text-[10px] font-mono text-t-muted uppercase tracking-[0.15em]">
          Markets
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
                'w-full flex items-center justify-between px-3 py-3 text-left',
                'border-l-2 transition-all duration-100',
                isSelected
                  ? 'bg-t-surface border-t-cyan'
                  : 'border-transparent hover:bg-t-surface/50 hover:border-t-border',
              ].join(' ')}
            >
              {/* Left: symbol name */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className={`text-xs font-mono font-semibold leading-none ${isSelected ? 'text-t-cyan' : 'text-t-text'}`}>
                  {shortSym(sym)}
                </span>
                <span className="text-[10px] font-mono text-t-muted leading-none">USDT PERP</span>
              </div>

              {/* Right: price + pct */}
              <div className="flex flex-col items-end gap-1 min-w-0 ml-1">
                {tick ? (
                  <>
                    <span className="text-xs font-mono text-t-text tabular-nums leading-none">
                      {fmtPrice(tick.lastPrice)}
                    </span>
                    <span className={`text-[10px] font-mono tabular-nums leading-none ${priceUp ? 'text-t-green' : 'text-t-red'}`}>
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

      {/* Footer */}
      <div className="px-3 py-2 border-t border-t-border">
        <span className="text-[10px] font-mono text-t-muted">
          {watchlist.length} pairs
        </span>
      </div>
    </aside>
  );
}
