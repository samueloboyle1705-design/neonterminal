'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import { closeSimulatedPosition } from '@/lib/trading/simulator';
import { calcMargin, calcRoe } from '@/lib/trading/pnl';
import type { Position } from '@/types/trading';

function fmtPrice(n: number): string {
  if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 100) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtPnl(n: number): string {
  return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`;
}

function fmtRoe(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(1)}%`;
}

function fmtSize(n: number): string {
  return n < 0.01 ? n.toFixed(4) : n < 1 ? n.toFixed(3) : n.toFixed(2);
}

function PositionRow({ position }: { position: Position }) {
  const isBuy = position.side === 'Buy';
  const pnlPositive = position.unrealizedPnl >= 0;
  const margin = calcMargin(position.size, position.entryPrice, position.leverage);
  const roe = calcRoe(position.unrealizedPnl, margin);

  return (
    <tr className="hover:bg-t-surface/50 transition-colors duration-75 group border-b border-t-border/40 last:border-0">
      <td className="pl-4 pr-3 py-2.5 font-mono text-xs text-t-text whitespace-nowrap">
        <span className="font-semibold">{position.symbol.replace('USDT', '')}</span>
        <span className="text-t-muted">/USDT</span>
      </td>
      <td className="px-2 py-2.5 whitespace-nowrap">
        <span className={[
          'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider',
          isBuy ? 'bg-t-green-dim text-t-green' : 'bg-t-red-dim text-t-red',
        ].join(' ')}>
          {isBuy ? 'Long' : 'Short'}
        </span>
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-t-text tabular-nums whitespace-nowrap">
        {fmtSize(position.size)}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-t-sub tabular-nums">{fmtPrice(position.entryPrice)}</span>
          {(position.slPrice || position.tpPrice) && (
            <span className="font-mono text-[10px] tabular-nums text-t-muted leading-none">
              {position.slPrice ? <span className="text-t-red/70">SL {fmtPrice(position.slPrice)}</span> : null}
              {position.slPrice && position.tpPrice ? <span className="text-t-muted/50"> · </span> : null}
              {position.tpPrice ? <span className="text-t-green/70">TP {fmtPrice(position.tpPrice)}</span> : null}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-t-text tabular-nums whitespace-nowrap">
        {fmtPrice(position.markPrice)}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className={`font-mono text-xs tabular-nums ${pnlPositive ? 'text-t-green' : 'text-t-red'}`}>
            {fmtPnl(position.unrealizedPnl)}
          </span>
          <span className={`font-mono text-[10px] tabular-nums ${pnlPositive ? 'text-t-green/60' : 'text-t-red/60'}`}>
            {fmtRoe(roe)}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">
        {fmtPrice(position.liquidationPrice)}
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">
        {position.leverage}×
      </td>
      <td className="pr-4 py-2.5">
        <button
          onClick={() => closeSimulatedPosition(position.id, position.markPrice)}
          className={[
            'px-2.5 py-1 text-[10px] font-mono rounded border transition-all duration-100',
            'text-t-muted border-t-border',
            'hover:text-t-red hover:border-t-red hover:bg-t-red-dim',
            'opacity-0 group-hover:opacity-100',
          ].join(' ')}
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
      <div className="flex items-center border-b border-t-border shrink-0">
        <div className={[
          'flex items-center gap-2 px-4 py-2 border-r border-t-border',
          'border-b-2 -mb-px',
          positions.length > 0 ? 'border-b-t-cyan' : 'border-b-transparent',
        ].join(' ')}>
          <span className="text-xs font-mono text-t-sub uppercase tracking-wider">Positions</span>
          {positions.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-t-cyan-dim text-t-cyan rounded border border-t-cyan/20">
              {positions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-r border-t-border border-b-2 border-b-transparent -mb-px">
          <span className="text-xs font-mono text-t-muted uppercase tracking-wider">Orders</span>
          {openOrders.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-t-surface text-t-muted rounded">
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
            <thead className="sticky top-0 bg-t-panel z-10 border-b border-t-border">
              <tr>
                {['Symbol', 'Side', 'Size', 'Entry', 'Mark', 'uPnL / ROE', 'Liq.', 'Lev.', ''].map((h) => (
                  <th
                    key={h}
                    className={[
                      'py-1.5 text-[10px] font-mono text-t-muted font-normal whitespace-nowrap uppercase tracking-wider',
                      h === 'Symbol' ? 'pl-4 pr-3' : 'px-3',
                      h === '' ? 'pr-4' : '',
                    ].join(' ')}
                  >
                    {h}
                  </th>
                ))}
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
