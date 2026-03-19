'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import { placeMarketOrder } from '@/lib/trading/simulator';
import { roundSize } from '@/lib/trading/precision';
import type { TradeSide } from '@/types/trading';

type OrderMode = 'Market' | 'Limit';

const LEVERAGE_OPTIONS = [1, 5, 10, 20] as const;
type LeverageOption = (typeof LEVERAGE_OPTIONS)[number];

const PCT_PRESETS = [25, 50, 75, 100] as const;

function fmtPrice(n: number): string {
  return n > 0
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

function fmtCompact(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function OrderPanel() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const currentTick = useTerminalStore(selectCurrentPrice);
  const balance = useAccountStore((s) => s.balance);

  const [side, setSide] = useState<TradeSide>('Buy');
  const [mode, setMode] = useState<OrderMode>('Market');
  const [sizeInput, setSizeInput] = useState('');
  const [leverage, setLeverage] = useState<LeverageOption>(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cleanup timeout on unmount
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); }, []);

  // Reset feedback when symbol or side changes
  useEffect(() => { setError(null); setSuccess(null); }, [selectedSymbol, side]);

  const markPrice = currentTick?.markPrice ?? 0;
  const size = parseFloat(sizeInput) || 0;
  const notional = size * markPrice;
  const requiredMargin = notional > 0 ? notional / leverage : 0;
  const baseCurrency = selectedSymbol.replace('USDT', '');

  const isBuy = side === 'Buy';
  const canSubmit = mode === 'Market' && markPrice > 0 && size > 0;

  // Quick-fill: pct% of balance as margin, converted to base-asset size
  const handlePctFill = useCallback((pct: number) => {
    if (markPrice <= 0 || balance <= 0) return;
    const margin = (balance * pct) / 100;
    const rawSize = (margin * leverage) / markPrice;
    const filled = roundSize(rawSize, selectedSymbol);
    setSizeInput(String(filled));
    setError(null);
  }, [balance, leverage, markPrice, selectedSymbol]);

  const handleSubmit = useCallback(() => {
    setError(null);
    setSuccess(null);

    const result = placeMarketOrder({ symbol: selectedSymbol, side, size, leverage, markPrice });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSizeInput('');
    const msg = `${isBuy ? 'Long' : 'Short'} opened · ${size} ${baseCurrency} @ $${fmtPrice(markPrice)}`;
    setSuccess(msg);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(null), 4_000);
  }, [selectedSymbol, side, size, leverage, markPrice, isBuy, baseCurrency]);

  return (
    <aside className="w-60 flex flex-col border-l border-t-border bg-t-panel shrink-0 overflow-hidden">

      {/* Buy / Sell toggle */}
      <div className="flex shrink-0">
        {(['Buy', 'Sell'] as TradeSide[]).map((s) => {
          const active = side === s;
          return (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={[
                'flex-1 py-3 text-xs font-mono font-semibold uppercase tracking-widest',
                'transition-colors duration-100 border-b-2',
                active
                  ? s === 'Buy'
                    ? 'text-t-green bg-t-green-dim border-t-green'
                    : 'text-t-red bg-t-red-dim border-t-red'
                  : 'text-t-muted border-t-border hover:text-t-sub hover:bg-t-surface/40',
              ].join(' ')}
            >
              {s === 'Buy' ? 'Long / Buy' : 'Short / Sell'}
            </button>
          );
        })}
      </div>

      {/* Order mode tabs */}
      <div className="flex items-stretch h-8 border-b border-t-border shrink-0">
        {(['Market', 'Limit'] as OrderMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              'px-4 text-xs font-mono transition-colors duration-100 relative',
              mode === m ? 'text-t-sub' : 'text-t-muted hover:text-t-sub',
            ].join(' ')}
          >
            {m}
            {mode === m && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-t-border-hi" />
            )}
          </button>
        ))}
        <div className="flex-1" />
        {mode === 'Market' && (
          <span className="flex items-center pr-3 text-[10px] font-mono text-t-muted">
            fill @ mark
          </span>
        )}
      </div>

      {/* Form */}
      <div className="flex flex-col overflow-y-auto flex-1 min-h-0">

        {/* Mark price row */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-t-border/50">
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-widest">Mark Price</span>
          <span className="text-xs font-mono text-t-sub tabular-nums">
            {markPrice > 0 ? `$${fmtPrice(markPrice)}` : '—'}
          </span>
        </div>

        {/* Size input */}
        <div className="px-3 pt-3 pb-2">
          <label className="block text-[10px] font-mono text-t-muted uppercase tracking-widest mb-1.5">
            Size ({baseCurrency})
          </label>
          <input
            type="number"
            value={sizeInput}
            onChange={(e) => { setSizeInput(e.target.value); setError(null); }}
            placeholder="0.000"
            className={[
              'w-full bg-t-surface border rounded px-3 py-2.5',
              'text-sm font-mono text-t-text placeholder:text-t-muted',
              'outline-none transition-colors duration-100',
              'border-t-border focus:border-t-border-hi',
            ].join(' ')}
          />

          {/* % quick-fill buttons */}
          <div className="flex gap-1 mt-2">
            {PCT_PRESETS.map((pct) => (
              <button
                key={pct}
                onClick={() => handlePctFill(pct)}
                disabled={markPrice <= 0 || balance <= 0}
                className={[
                  'flex-1 py-1 text-[10px] font-mono rounded',
                  'border border-t-border bg-t-surface text-t-muted',
                  'hover:border-t-border-hi hover:text-t-sub',
                  'transition-colors duration-100',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div className="mx-3 mb-3 border border-t-border rounded bg-t-surface/40">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-t-border/50">
            <span className="text-[10px] font-mono text-t-muted">Notional</span>
            <span className="text-xs font-mono text-t-sub tabular-nums">
              {notional > 0 ? `$${fmtCompact(notional)}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-t-border/50">
            <span className="text-[10px] font-mono text-t-muted">Margin req.</span>
            <span className="text-xs font-mono text-t-sub tabular-nums">
              {requiredMargin > 0 ? `$${fmtCompact(requiredMargin)}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[10px] font-mono text-t-muted">Available</span>
            <span className={`text-xs font-mono tabular-nums ${requiredMargin > 0 && requiredMargin > balance ? 'text-t-red' : 'text-t-text'}`}>
              ${fmtCompact(balance)}
            </span>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mx-3 mb-2 px-3 py-2 rounded bg-t-red-dim border border-t-red/20">
            <p className="text-xs font-mono text-t-red leading-snug">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-3 mb-2 px-3 py-2 rounded bg-t-green-dim border border-t-green/20">
            <p className="text-xs font-mono text-t-green leading-snug">{success}</p>
          </div>
        )}

        {/* Submit */}
        <div className="px-3 pb-3">
          {mode === 'Market' ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={[
                'w-full py-3 rounded text-xs font-mono font-bold uppercase tracking-widest',
                'border transition-all duration-100',
                isBuy
                  ? 'bg-t-green-dim border-t-green/40 text-t-green hover:bg-t-green/10'
                  : 'bg-t-red-dim border-t-red/40 text-t-red hover:bg-t-red/10',
                !canSubmit && 'opacity-30 cursor-not-allowed',
              ].join(' ')}
            >
              {isBuy ? 'Buy / Long' : 'Sell / Short'}
            </button>
          ) : (
            <button
              disabled
              className={[
                'w-full py-3 rounded text-xs font-mono font-bold uppercase tracking-widest',
                'border opacity-25 cursor-not-allowed',
                isBuy
                  ? 'bg-t-green-dim border-t-green/20 text-t-green'
                  : 'bg-t-red-dim border-t-red/20 text-t-red',
              ].join(' ')}
            >
              Market only (sim)
            </button>
          )}
        </div>
      </div>

      {/* Leverage selector */}
      <div className="px-3 py-3 border-t border-t-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-widest">Leverage</span>
          <span className={`text-xs font-mono font-semibold ${isBuy ? 'text-t-green' : 'text-t-red'}`}>
            {leverage}×
          </span>
        </div>
        <div className="flex gap-1">
          {LEVERAGE_OPTIONS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLeverage(lv)}
              className={[
                'flex-1 py-1.5 text-[10px] font-mono rounded border transition-colors duration-100',
                leverage === lv
                  ? isBuy
                    ? 'bg-t-green-dim border-t-green/40 text-t-green'
                    : 'bg-t-red-dim border-t-red/40 text-t-red'
                  : 'bg-t-surface border-t-border text-t-muted hover:text-t-sub hover:border-t-border-hi',
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
