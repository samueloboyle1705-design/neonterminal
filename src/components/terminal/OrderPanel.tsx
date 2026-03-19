'use client';

import { useState, useCallback } from 'react';
import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import { placeMarketOrder } from '@/lib/trading/simulator';
import type { TradeSide } from '@/types/trading';

type OrderType = 'Market' | 'Limit';

const LEVERAGE_OPTIONS = [1, 5, 10, 20] as const;
type LeverageOption = (typeof LEVERAGE_OPTIONS)[number];

function fmtPrice(n: number): string {
  return n > 0
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

export function OrderPanel() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const currentTick = useTerminalStore(selectCurrentPrice);
  const balance = useAccountStore((s) => s.balance);

  // Local UI state
  const [side, setSide] = useState<TradeSide>('Buy');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [priceInput, setPriceInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [leverage, setLeverage] = useState<LeverageOption>(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const markPrice = currentTick?.markPrice ?? 0;

  // Compute notional value estimate
  const execPrice = parseFloat(priceInput) || markPrice;
  const size = parseFloat(sizeInput) || 0;
  const notional = execPrice * size;
  const requiredMargin = notional > 0 ? notional / leverage : 0;

  const isBuy = side === 'Buy';
  const sideBg = isBuy ? 'bg-t-green-dim' : 'bg-t-red-dim';
  const sideBorder = isBuy ? 'border-t-green' : 'border-t-red';
  const sideText = isBuy ? 'text-t-green' : 'text-t-red';

  const canSubmit =
    orderType === 'Market' &&
    markPrice > 0 &&
    size > 0;

  const handleSubmit = useCallback(() => {
    setError(null);
    setSuccess(null);

    const result = placeMarketOrder({
      symbol: selectedSymbol,
      side,
      size,
      leverage,
      markPrice,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSizeInput('');
    setSuccess(`${isBuy ? 'Long' : 'Short'} opened at $${fmtPrice(markPrice)}`);
    setTimeout(() => setSuccess(null), 3_000);
  }, [selectedSymbol, side, size, leverage, markPrice, isBuy]);

  return (
    <aside className="w-64 flex flex-col border-l border-t-border bg-t-panel shrink-0 overflow-hidden">
      {/* Buy / Sell toggle */}
      <div className="flex border-b border-t-border shrink-0">
        {(['Buy', 'Sell'] as TradeSide[]).map((s) => (
          <button
            key={s}
            onClick={() => { setSide(s); setError(null); setSuccess(null); }}
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
        {(['Market', 'Limit'] as OrderType[]).map((t) => (
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

        {/* Price field (Limit only — disabled in sim) */}
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
            onChange={(e) => { setSizeInput(e.target.value); setError(null); }}
            placeholder="0.000"
            className={[
              'w-full bg-t-surface border rounded px-2.5 py-2',
              'text-xs font-mono text-t-text placeholder:text-t-muted',
              'outline-none focus:border-t-border-hi',
              'border-t-border',
            ].join(' ')}
          />
        </div>

        {/* Notional / margin estimate */}
        <div className="flex flex-col gap-0.5 py-1 border-t border-t-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-t-muted">Value</span>
            <span className="text-xs font-mono text-t-sub tabular-nums">
              {notional > 0
                ? `≈ $${notional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-t-muted">Margin</span>
            <span className="text-xs font-mono text-t-sub tabular-nums">
              {requiredMargin > 0
                ? `≈ $${requiredMargin.toFixed(2)}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-t-muted">Balance</span>
            <span className="text-xs font-mono text-t-sub tabular-nums">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Error / success feedback */}
        {error && (
          <p className="text-xs font-mono text-t-red leading-tight">{error}</p>
        )}
        {success && (
          <p className="text-xs font-mono text-t-green leading-tight">{success}</p>
        )}

        {/* Submit button */}
        {orderType === 'Market' ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'w-full py-2.5 rounded text-xs font-mono font-semibold uppercase tracking-wider',
              'border transition-opacity duration-100',
              `${sideBg} ${sideBorder} ${sideText}`,
              canSubmit
                ? 'opacity-100 cursor-pointer hover:opacity-90 active:opacity-80'
                : 'opacity-40 cursor-not-allowed',
            ].join(' ')}
          >
            {isBuy ? 'Buy / Long' : 'Sell / Short'}
          </button>
        ) : (
          <button
            disabled
            className={[
              'w-full py-2.5 rounded text-xs font-mono font-semibold uppercase tracking-wider',
              'border transition-opacity duration-100',
              `${sideBg} ${sideBorder} ${sideText}`,
              'opacity-40 cursor-not-allowed',
            ].join(' ')}
            title="Limit orders not yet simulated"
          >
            {isBuy ? 'Buy / Long' : 'Sell / Short'}
          </button>
        )}

        {orderType === 'Limit' && (
          <p className="text-center text-xs font-mono text-t-muted pt-0.5">
            Switch to Market to trade
          </p>
        )}
      </div>

      {/* Leverage selector */}
      <div className="mt-auto px-3 py-3 border-t border-t-border shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-t-muted">Leverage</span>
          <span className="text-xs font-mono text-t-sub">{leverage}×</span>
        </div>
        <div className="flex gap-1">
          {LEVERAGE_OPTIONS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLeverage(lv)}
              className={[
                'flex-1 py-1 text-xs font-mono rounded-sm transition-colors duration-100',
                leverage === lv
                  ? `${sideBg} ${sideText} border ${sideBorder}`
                  : 'bg-t-surface text-t-muted hover:text-t-sub border border-t-border',
              ].join(' ')}
            >
              {lv}×
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
