'use client';

import { useState } from 'react';
import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';

type Side = 'Buy' | 'Sell';
type OrderType = 'Market' | 'Limit';

function fmtPrice(n: number): string {
  return n > 0
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

export function OrderPanel() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const currentTick = useTerminalStore(selectCurrentPrice);

  // Local UI state — not global (order form is ephemeral)
  const [side, setSide] = useState<Side>('Buy');
  const [orderType, setOrderType] = useState<OrderType>('Limit');
  const [priceInput, setPriceInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const markPrice = currentTick?.markPrice ?? 0;

  // Compute notional value estimate
  const price = parseFloat(priceInput) || markPrice;
  const size = parseFloat(sizeInput) || 0;
  const notional = price * size;

  const isBuy = side === 'Buy';
  const sideColor = isBuy ? 'text-t-green' : 'text-t-red';
  const sideBg = isBuy ? 'bg-t-green-dim' : 'bg-t-red-dim';
  const sideBorder = isBuy ? 'border-t-green' : 'border-t-red';
  const sideText = isBuy ? 'text-t-green' : 'text-t-red';

  return (
    <aside className="w-64 flex flex-col border-l border-t-border bg-t-panel shrink-0 overflow-hidden">
      {/* Buy / Sell toggle */}
      <div className="flex border-b border-t-border shrink-0">
        {(['Buy', 'Sell'] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={[
              'flex-1 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider',
              'transition-colors duration-100',
              side === s
                ? s === 'Buy'
                  ? 'text-t-green bg-t-green-dim'
                  : 'text-t-red bg-t-red-dim'
                : 'text-t-muted hover:text-t-sub',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Order type tabs */}
      <div className="flex gap-0.5 px-3 pt-3 pb-2 shrink-0">
        {(['Limit', 'Market'] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={[
              'px-2.5 py-1 text-xs font-mono rounded-sm transition-colors duration-100',
              orderType === t
                ? 'bg-t-surface text-t-text'
                : 'text-t-muted hover:text-t-sub',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-2 px-3 pb-3 shrink-0">
        {/* Mark price reference */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-t-muted font-mono">Mark</span>
          <span className="text-xs font-mono text-t-sub tabular-nums">
            {markPrice > 0 ? fmtPrice(markPrice) : '—'}
          </span>
        </div>

        {/* Price field (hidden for Market orders) */}
        {orderType === 'Limit' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-t-muted">Price (USDT)</label>
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder={markPrice > 0 ? fmtPrice(markPrice) : '0.00'}
              className={[
                'w-full bg-t-surface border rounded px-2.5 py-2',
                'text-xs font-mono text-t-text placeholder:text-t-muted',
                'outline-none focus:border-t-border-hi',
                'border-t-border',
              ].join(' ')}
            />
          </div>
        )}

        {/* Size field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-t-muted">
            Size ({selectedSymbol.replace('USDT', '')})
          </label>
          <input
            type="number"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="0.000"
            className={[
              'w-full bg-t-surface border rounded px-2.5 py-2',
              'text-xs font-mono text-t-text placeholder:text-t-muted',
              'outline-none focus:border-t-border-hi',
              'border-t-border',
            ].join(' ')}
          />
        </div>

        {/* Notional value estimate */}
        <div className="flex items-center justify-between py-1 border-t border-t-border">
          <span className="text-xs font-mono text-t-muted">Value</span>
          <span className="text-xs font-mono text-t-sub tabular-nums">
            {notional > 0
              ? `≈ $${notional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </span>
        </div>

        {/* Submit button */}
        <button
          disabled
          className={[
            'w-full py-2.5 rounded text-xs font-mono font-semibold uppercase tracking-wider',
            'border transition-opacity duration-100',
            `${sideBg} ${sideBorder} ${sideText}`,
            'opacity-40 cursor-not-allowed',
          ].join(' ')}
          title="Trading coming soon"
        >
          {isBuy ? 'Buy' : 'Sell'} / Long
        </button>

        <p className="text-center text-xs font-mono text-t-muted pt-1">
          Simulated trading coming soon
        </p>
      </div>

      {/* Leverage indicator — placeholder */}
      <div className="mt-auto px-3 py-3 border-t border-t-border shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-t-muted">Leverage</span>
          <span className="text-xs font-mono text-t-sub">10×</span>
        </div>
        <div className="mt-1.5 h-1 bg-t-surface rounded-full overflow-hidden">
          <div className={`h-full w-1/3 rounded-full ${isBuy ? 'bg-t-green' : 'bg-t-red'} opacity-40`} />
        </div>
      </div>
    </aside>
  );
}
