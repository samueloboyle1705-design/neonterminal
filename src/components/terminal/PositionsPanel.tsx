'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import { closeSimulatedPosition } from '@/lib/trading/simulator';
import type { Position } from '@/types/trading';

function fmtPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPnl(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function PositionRow({ position }: { position: Position }) {
  const isBuy = position.side === 'Buy';
  const pnlPositive = position.unrealizedPnl >= 0;

  return (
    <tr className="hover:bg-t-surface transition-colors duration-75 group">
      <td className="px-3 py-2 font-mono text-xs text-t-text whitespace-nowrap">
        {position.symbol.replace('USDT', '')}
        <span className="text-t-muted">/USDT</span>
      </td>
      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
        <span
          className={`px-1.5 py-0.5 rounded-sm text-xs font-semibold ${
            isBuy ? 'bg-t-green-dim text-t-green' : 'bg-t-red-dim text-t-red'
          }`}
        >
          {position.side}
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-text tabular-nums whitespace-nowrap">
        {position.size}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-sub tabular-nums whitespace-nowrap">
        {fmtPrice(position.entryPrice)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-sub tabular-nums whitespace-nowrap">
        {fmtPrice(position.markPrice)}
      </td>
      <td
        className={`px-3 py-2 font-mono text-xs tabular-nums whitespace-nowrap ${
          pnlPositive ? 'text-t-green' : 'text-t-red'
        }`}
      >
        {fmtPnl(position.unrealizedPnl)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">
        {fmtPrice(position.liquidationPrice)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">
        {position.leverage}×
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => closeSimulatedPosition(position.id, position.markPrice)}
          className="px-2 py-0.5 text-xs font-mono text-t-muted border border-t-border rounded-sm
                     hover:text-t-red hover:border-t-red transition-colors duration-100 opacity-0
                     group-hover:opacity-100"
        >
          Close
        </button>
      </td>
    </tr>
  );
}

export function PositionsPanel() {
  const positions = useTerminalStore((s) => s.positions);
  const openOrders = useTerminalStore((s) => s.openOrders);

  return (
    <section className="h-44 flex flex-col border-t border-t-border bg-t-panel shrink-0">
      {/* Panel tabs */}
      <div className="flex items-center gap-0 border-b border-t-border shrink-0">
        <div className="flex items-center gap-1.5 px-4 py-2 border-r border-t-border">
          <span className="text-xs font-mono text-t-sub uppercase tracking-wider">Positions</span>
          {positions.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-mono bg-t-surface text-t-text rounded-sm">
              {positions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 border-r border-t-border">
          <span className="text-xs font-mono text-t-muted uppercase tracking-wider">Orders</span>
          {openOrders.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-mono bg-t-surface text-t-muted rounded-sm">
              {openOrders.length}
            </span>
          )}
        </div>
        <div className="flex-1" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {positions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-mono text-t-muted">No open positions</span>
          </div>
        ) : (
          <table className="w-full text-left min-w-max">
            <thead className="sticky top-0 bg-t-panel z-10">
              <tr className="border-b border-t-border">
                {['Symbol', 'Side', 'Size', 'Entry', 'Mark', 'uPnL', 'Liq.', 'Lev.', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-1.5 text-xs font-mono text-t-muted font-normal whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <PositionRow key={pos.id} position={pos} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
