'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import { placeMarketOrder, placePendingOrder } from '@/lib/trading/simulator';
import { roundSize } from '@/lib/trading/precision';
import { calcMargin } from '@/lib/trading/pnl';
import { calcSizeFromRisk, calcRiskMetrics, validateSlTp } from '@/lib/trading/risk';
import type { TradeSide } from '@/types/trading';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVERAGE_OPTIONS = [1, 5, 10, 20, 50] as const;
type LeverageOption = (typeof LEVERAGE_OPTIONS)[number];

const PCT_PRESETS = [25, 50, 75, 100] as const;
type SizeMode = 'manual' | 'risk';
type RiskUnit = '$' | '%';
type OrderType = 'Market' | 'Limit' | 'Stop';

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (!n || !isFinite(n)) return '';
  if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 100)    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtUsdt(n: number, showSign = false): string {
  const sign = showSign ? (n >= 0 ? '+' : '') : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number, showSign = false): string {
  const sign = showSign ? (n >= 0 ? '+' : '') : '';
  return `${sign}${(Math.abs(n) * 100).toFixed(2)}%`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
      <span className="text-[9px] font-mono text-t-muted uppercase tracking-[0.18em]">
        {children}
      </span>
      <div className="flex-1 h-px bg-t-border/60" />
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueClass = 'text-t-sub',
  alert = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-0.5">
      <span className="text-[10px] font-mono text-t-muted">{label}</span>
      <span className={`text-[11px] font-mono tabular-nums ${alert ? 'text-t-red' : valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ── Order type descriptions ───────────────────────────────────────────────────

const ORDER_TYPE_HINTS: Record<OrderType, string> = {
  Market: 'fill @ mark',
  Limit:  'fill at or better',
  Stop:   'breakout trigger',
};

// ── Main component ────────────────────────────────────────────────────────────

export function OrderPanel() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const currentTick    = useTerminalStore(selectCurrentPrice);
  const balance        = useAccountStore((s) => s.balance);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [side, setSide]               = useState<TradeSide>('Buy');
  const [orderType, setOrderType]     = useState<OrderType>('Market');
  const [sizeMode, setSizeMode]       = useState<SizeMode>('manual');
  const [sizeInput, setSizeInput]     = useState('');
  const [riskInput, setRiskInput]     = useState('');
  const [riskUnit, setRiskUnit]       = useState<RiskUnit>('$');
  const [triggerInput, setTriggerInput] = useState('');
  const [slInput, setSlInput]         = useState('');
  const [tpInput, setTpInput]         = useState('');
  const [leverage, setLeverage]       = useState<LeverageOption>(10);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // Reset inputs when symbol changes
  useEffect(() => {
    setError(null); setSuccess(null);
    setSizeInput(''); setRiskInput('');
    setSlInput(''); setTpInput('');
    setTriggerInput('');
  }, [selectedSymbol]);

  // Clear feedback on side / type change
  useEffect(() => { setError(null); setSuccess(null); }, [side, orderType]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const markPrice    = currentTick?.markPrice ?? 0;
  const baseCurrency = selectedSymbol.replace('USDT', '');
  const isBuy        = side === 'Buy';
  const isPending    = orderType !== 'Market';

  // Trigger price (only relevant for Limit/Stop orders)
  const triggerPrice = useMemo(() => {
    const v = parseFloat(triggerInput);
    return v > 0 ? v : null;
  }, [triggerInput]);

  // The price used as entry reference for SL/TP validation and risk metrics
  const effectiveEntryPrice = isPending
    ? (triggerPrice ?? markPrice)
    : markPrice;

  const slPrice = useMemo(() => {
    const v = parseFloat(slInput);
    return v > 0 ? v : null;
  }, [slInput]);

  const tpPrice = useMemo(() => {
    const v = parseFloat(tpInput);
    return v > 0 ? v : null;
  }, [tpInput]);

  const riskDollars = useMemo(() => {
    const raw = parseFloat(riskInput) || 0;
    return riskUnit === '%' ? (raw / 100) * balance : raw;
  }, [riskInput, riskUnit, balance]);

  const size = useMemo(() => {
    if (sizeMode === 'manual') return parseFloat(sizeInput) || 0;
    if (riskDollars > 0 && slPrice !== null && slPrice > 0 && effectiveEntryPrice > 0) {
      return roundSize(calcSizeFromRisk(riskDollars, effectiveEntryPrice, slPrice), selectedSymbol);
    }
    return 0;
  }, [sizeMode, sizeInput, riskDollars, slPrice, effectiveEntryPrice, selectedSymbol]);

  const { slError, tpError } = useMemo(
    () => validateSlTp(side, effectiveEntryPrice, slPrice, tpPrice),
    [side, effectiveEntryPrice, slPrice, tpPrice],
  );

  const metrics = useMemo(
    () => calcRiskMetrics(side, size, effectiveEntryPrice, slPrice, tpPrice),
    [side, size, effectiveEntryPrice, slPrice, tpPrice],
  );

  const notional       = size * effectiveEntryPrice;
  const requiredMargin = calcMargin(size, effectiveEntryPrice, leverage);

  // Trigger price validation for pending orders
  const triggerError = useMemo(() => {
    if (!isPending || !triggerPrice) return null;
    if (markPrice <= 0) return null; // no live price yet
    if (orderType === 'Limit') {
      if (side === 'Buy'  && triggerPrice >= markPrice) return 'Limit Buy must be below mark price';
      if (side === 'Sell' && triggerPrice <= markPrice) return 'Limit Sell must be above mark price';
    }
    if (orderType === 'Stop') {
      if (side === 'Buy'  && triggerPrice <= markPrice) return 'Stop Buy must be above mark price';
      if (side === 'Sell' && triggerPrice >= markPrice) return 'Stop Sell must be below mark price';
    }
    return null;
  }, [isPending, orderType, side, triggerPrice, markPrice]);

  const canSubmit = effectiveEntryPrice > 0 && size > 0 && !slError && !tpError &&
    (!isPending || (triggerPrice !== null && !triggerError));

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePctFill = useCallback((pct: number) => {
    const refPrice = effectiveEntryPrice > 0 ? effectiveEntryPrice : markPrice;
    if (refPrice <= 0 || balance <= 0) return;
    const margin  = (balance * pct) / 100;
    const rawSize = (margin * leverage) / refPrice;
    setSizeInput(String(roundSize(rawSize, selectedSymbol)));
    setError(null);
  }, [balance, leverage, effectiveEntryPrice, markPrice, selectedSymbol]);

  const handleSubmit = useCallback(() => {
    setError(null); setSuccess(null);

    if (isPending) {
      if (!triggerPrice || triggerPrice <= 0) {
        setError('Enter a trigger price for this order type');
        return;
      }

      const result = placePendingOrder({
        symbol: selectedSymbol,
        side,
        orderType: orderType as 'Limit' | 'Stop',
        size,
        triggerPrice,
        leverage,
        slPrice: slPrice ?? undefined,
        tpPrice: tpPrice ?? undefined,
      });

      if (!result.ok) { setError(result.error); return; }

      setSizeInput(''); setRiskInput(''); setTriggerInput('');
      const msg = `${orderType} ${isBuy ? 'Long' : 'Short'} placed · ${size} ${baseCurrency} @ $${fmtPrice(triggerPrice)}`;
      setSuccess(msg);
    } else {
      const result = placeMarketOrder({
        symbol: selectedSymbol, side, size, leverage, markPrice,
        slPrice: slPrice ?? undefined,
        tpPrice: tpPrice ?? undefined,
      });

      if (!result.ok) { setError(result.error); return; }

      setSizeInput(''); setRiskInput('');
      const msg = `${isBuy ? 'Long' : 'Short'} opened · ${size} ${baseCurrency} @ $${fmtPrice(markPrice)}`;
      setSuccess(msg);
    }

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSuccess(null), 4_000);
  }, [
    isPending, triggerPrice, selectedSymbol, side, orderType, size, leverage,
    markPrice, slPrice, tpPrice, isBuy, baseCurrency,
  ]);

  // ── Colour helpers ──────────────────────────────────────────────────────────
  const activeGreen = 'bg-t-green-dim border-t-green text-t-green';
  const activeRed   = 'bg-t-red-dim   border-t-red   text-t-red';
  const sideActive  = isBuy ? activeGreen : activeRed;
  const btnInactive = 'bg-t-surface border-t-border text-t-muted hover:border-t-border-hi hover:text-t-sub';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <aside className="w-64 flex flex-col border-l border-t-border bg-t-panel shrink-0 overflow-hidden">

      {/* ── Side toggle ───────────────────────────────────────────────────── */}
      <div className="flex shrink-0">
        {(['Buy', 'Sell'] as TradeSide[]).map((s) => {
          const active = side === s;
          return (
            <button key={s} onClick={() => setSide(s)}
              className={[
                'flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-widest',
                'transition-colors duration-100 border-b-2',
                active
                  ? (s === 'Buy' ? 'text-t-green bg-t-green-dim border-t-green' : 'text-t-red bg-t-red-dim border-t-red')
                  : 'text-t-muted border-t-border hover:text-t-sub hover:bg-t-surface/40',
              ].join(' ')}
            >
              {s === 'Buy' ? 'Long / Buy' : 'Short / Sell'}
            </button>
          );
        })}
      </div>

      {/* ── Order type tabs ───────────────────────────────────────────────── */}
      <div className="flex items-stretch border-b border-t-border shrink-0">
        {(['Market', 'Limit', 'Stop'] as OrderType[]).map((ot) => {
          const active = orderType === ot;
          return (
            <button
              key={ot}
              onClick={() => setOrderType(ot)}
              className={[
                'relative flex items-center px-3 h-7 text-[10px] font-mono transition-colors duration-100',
                active
                  ? 'text-t-sub'
                  : 'text-t-muted hover:text-t-sub',
              ].join(' ')}
            >
              {ot}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-t-border-hi" />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="flex items-center pr-3 text-[9px] font-mono text-t-muted tracking-wide">
          {ORDER_TYPE_HINTS[orderType]}
        </span>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Mark price reference */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-t-border/40">
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-widest">Mark</span>
          <span className={`text-xs font-mono tabular-nums font-semibold ${isBuy ? 'text-t-green' : 'text-t-red'}`}>
            {markPrice > 0 ? `$${fmtPrice(markPrice)}` : '—'}
          </span>
        </div>

        {/* ── Trigger price (Limit / Stop only) ─────────────────────────── */}
        {isPending && (
          <>
            <SectionLabel>Trigger Price</SectionLabel>
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-t-cyan w-5 shrink-0 font-semibold">@</span>
                <input
                  type="number"
                  value={triggerInput}
                  placeholder={markPrice > 0 ? fmtPrice(markPrice) : 'Price'}
                  onChange={(e) => { setTriggerInput(e.target.value); setError(null); }}
                  className={[
                    'flex-1 min-w-0 bg-t-surface border rounded px-2.5 py-1.5 text-xs font-mono text-t-text placeholder:text-t-muted outline-none transition-colors',
                    triggerError ? 'border-t-red/60 focus:border-t-red' : 'border-t-border focus:border-t-border-hi',
                  ].join(' ')}
                />
                <span className="text-[9px] font-mono text-t-muted shrink-0">USDT</span>
              </div>
              {triggerError && (
                <p className="text-[9px] font-mono text-t-red mt-0.5 pl-6">{triggerError}</p>
              )}
              {!triggerError && triggerPrice && markPrice > 0 && (
                <p className="text-[9px] font-mono text-t-muted mt-0.5 pl-6">
                  {orderType === 'Limit'
                    ? `≈ ${fmtPct((triggerPrice - markPrice) / markPrice, true)} from mark`
                    : `triggers ${triggerPrice > markPrice ? 'above' : 'below'} mark`}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── SIZE SECTION ──────────────────────────────────────────────── */}
        <SectionLabel>Size</SectionLabel>

        {/* Manual / Risk toggle */}
        <div className="flex gap-1 px-3 mb-2">
          {(['manual', 'risk'] as SizeMode[]).map((m) => (
            <button key={m} onClick={() => setSizeMode(m)}
              className={[
                'flex-1 py-1 text-[10px] font-mono rounded border transition-colors duration-100',
                sizeMode === m ? sideActive : btnInactive,
              ].join(' ')}
            >
              {m === 'manual' ? 'Manual' : 'Risk-based'}
            </button>
          ))}
        </div>

        {sizeMode === 'manual' ? (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-mono text-t-muted w-8 shrink-0">Size</span>
              <input
                type="number" value={sizeInput} placeholder="0.000"
                onChange={(e) => { setSizeInput(e.target.value); setError(null); }}
                className="flex-1 min-w-0 bg-t-surface border border-t-border rounded px-2.5 py-1.5 text-xs font-mono text-t-text placeholder:text-t-muted outline-none focus:border-t-border-hi transition-colors"
              />
              <span className="text-[10px] font-mono text-t-muted shrink-0">{baseCurrency}</span>
            </div>
            <div className="flex gap-1">
              {PCT_PRESETS.map((pct) => (
                <button key={pct} onClick={() => handlePctFill(pct)}
                  disabled={effectiveEntryPrice <= 0 || balance <= 0}
                  className={['flex-1 py-1 text-[9px] font-mono rounded border transition-colors duration-100', btnInactive, 'disabled:opacity-25 disabled:cursor-not-allowed'].join(' ')}
                >
                  {pct === 100 ? 'Max' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-mono text-t-muted w-8 shrink-0">Risk</span>
              <input
                type="number" value={riskInput} placeholder="0.00"
                onChange={(e) => { setRiskInput(e.target.value); setError(null); }}
                className="flex-1 min-w-0 bg-t-surface border border-t-border rounded px-2.5 py-1.5 text-xs font-mono text-t-text placeholder:text-t-muted outline-none focus:border-t-border-hi transition-colors"
              />
              <button onClick={() => setRiskUnit(riskUnit === '$' ? '%' : '$')}
                className={['px-2 py-1.5 text-[10px] font-mono rounded border transition-colors duration-100 shrink-0', sideActive].join(' ')}
              >
                {riskUnit}
              </button>
            </div>
            {riskDollars > 0 && balance > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-t-muted">
                  {riskUnit === '$'
                    ? `≈ ${((riskDollars / balance) * 100).toFixed(2)}% of balance`
                    : `≈ ${fmtUsdt(riskDollars)}`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded border bg-t-surface/40 border-t-border/60">
              <span className="text-[10px] font-mono text-t-muted">Computed size</span>
              <span className="text-xs font-mono tabular-nums text-t-text">
                {size > 0
                  ? `${size} ${baseCurrency}`
                  : <span className="text-t-muted italic">set SL first</span>}
              </span>
            </div>
          </div>
        )}

        {/* ── SL / TP SECTION ───────────────────────────────────────────── */}
        <SectionLabel>Stop Loss / Take Profit</SectionLabel>

        {isPending && effectiveEntryPrice > 0 && (
          <div className="mx-3 mb-1.5 px-2.5 py-1 rounded border border-t-cyan/20 bg-t-surface/30">
            <p className="text-[9px] font-mono text-t-muted">
              Validating SL/TP against trigger price{triggerPrice ? ` ($${fmtPrice(triggerPrice)})` : ''}
            </p>
          </div>
        )}

        {/* SL row */}
        <div className="px-3 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-t-red w-5 shrink-0 font-semibold">SL</span>
            <input
              type="number" value={slInput} placeholder="Price"
              onChange={(e) => { setSlInput(e.target.value); setError(null); }}
              className={[
                'flex-1 min-w-0 bg-t-surface border rounded px-2.5 py-1.5 text-xs font-mono text-t-text placeholder:text-t-muted outline-none transition-colors',
                slError ? 'border-t-red/60 focus:border-t-red' : 'border-t-border focus:border-t-border-hi',
              ].join(' ')}
            />
            {slPrice && !slError && metrics.slDistance > 0 ? (
              <div className="flex flex-col items-end shrink-0 gap-0">
                <span className="text-[9px] font-mono text-t-red tabular-nums">
                  {fmtPct(metrics.slPct)}
                </span>
                <span className="text-[9px] font-mono text-t-red tabular-nums">
                  {fmtUsdt(metrics.slPnl, true)}
                </span>
              </div>
            ) : (
              <div className="w-14 shrink-0" />
            )}
          </div>
          {slError && (
            <p className="text-[9px] font-mono text-t-red mt-0.5 pl-6">{slError}</p>
          )}
        </div>

        {/* TP row */}
        <div className="px-3 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-t-green w-5 shrink-0 font-semibold">TP</span>
            <input
              type="number" value={tpInput} placeholder="Price"
              onChange={(e) => { setTpInput(e.target.value); setError(null); }}
              className={[
                'flex-1 min-w-0 bg-t-surface border rounded px-2.5 py-1.5 text-xs font-mono text-t-text placeholder:text-t-muted outline-none transition-colors',
                tpError ? 'border-t-red/60 focus:border-t-red' : 'border-t-border focus:border-t-border-hi',
              ].join(' ')}
            />
            {tpPrice && !tpError && metrics.tpDistance > 0 ? (
              <div className="flex flex-col items-end shrink-0 gap-0">
                <span className="text-[9px] font-mono text-t-green tabular-nums">
                  {fmtPct(metrics.tpPct)}
                </span>
                <span className="text-[9px] font-mono text-t-green tabular-nums">
                  {fmtUsdt(metrics.tpPnl, true)}
                </span>
              </div>
            ) : (
              <div className="w-14 shrink-0" />
            )}
          </div>
          {tpError && (
            <p className="text-[9px] font-mono text-t-red mt-0.5 pl-6">{tpError}</p>
          )}
        </div>

        {/* R:R row */}
        {metrics.rrRatio > 0 && (
          <div className="mx-3 mb-1.5 flex items-center justify-between px-2.5 py-1.5 rounded border bg-t-surface/40 border-t-border/60">
            <span className="text-[10px] font-mono text-t-muted">Risk : Reward</span>
            <span className="text-xs font-mono font-semibold text-t-cyan tabular-nums">
              1 : {metrics.rrRatio.toFixed(2)}
            </span>
          </div>
        )}

        {/* ── ORDER SUMMARY ─────────────────────────────────────────────── */}
        <SectionLabel>Summary</SectionLabel>

        <div className="mx-3 mb-2 rounded border border-t-border bg-t-surface/30 overflow-hidden">
          {isPending && triggerPrice && (
            <MetricRow
              label="Trigger"
              value={`$${fmtPrice(triggerPrice)}`}
              valueClass="text-t-cyan"
            />
          )}
          <MetricRow label="Notional"    value={notional > 0 ? `$${fmtPrice(notional)}` : '—'} />
          <MetricRow label="Margin req." value={requiredMargin > 0 ? `$${fmtPrice(requiredMargin)}` : '—'} />
          <MetricRow
            label="Available"
            value={`$${fmtPrice(balance)}`}
            alert={requiredMargin > 0 && requiredMargin > balance}
          />
          {slPrice && !slError && metrics.slPnl !== 0 && (
            <MetricRow
              label="Max loss (SL)"
              value={fmtUsdt(metrics.slPnl, true)}
              valueClass="text-t-red"
            />
          )}
          {tpPrice && !tpError && metrics.tpPnl !== 0 && (
            <MetricRow
              label="Target (TP)"
              value={fmtUsdt(metrics.tpPnl, true)}
              valueClass="text-t-green"
            />
          )}
        </div>

        {/* ── Feedback ──────────────────────────────────────────────────── */}
        {error && (
          <div className="mx-3 mb-2 px-3 py-2 rounded bg-t-red-dim border border-t-red/25">
            <p className="text-[10px] font-mono text-t-red leading-snug">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-3 mb-2 px-3 py-2 rounded bg-t-green-dim border border-t-green/25">
            <p className="text-[10px] font-mono text-t-green leading-snug">{success}</p>
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <div className="px-3 pb-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'w-full py-3 rounded text-xs font-mono font-bold uppercase tracking-widest',
              'border transition-all duration-100',
              isBuy
                ? 'bg-t-green-dim border-t-green/40 text-t-green hover:bg-t-green/10'
                : 'bg-t-red-dim   border-t-red/40   text-t-red   hover:bg-t-red/10',
              !canSubmit && 'opacity-30 cursor-not-allowed',
            ].join(' ')}
          >
            {isPending
              ? `Place ${orderType} ${isBuy ? 'Buy' : 'Sell'}`
              : (isBuy ? 'Buy / Long' : 'Sell / Short')}
          </button>
        </div>
      </div>

      {/* ── Leverage (pinned footer) ───────────────────────────────────────── */}
      <div className="px-3 py-2.5 border-t border-t-border shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono text-t-muted uppercase tracking-[0.18em]">Leverage</span>
          <span className={`text-xs font-mono font-bold ${isBuy ? 'text-t-green' : 'text-t-red'}`}>
            {leverage}×
          </span>
        </div>
        <div className="flex gap-1">
          {LEVERAGE_OPTIONS.map((lv) => (
            <button key={lv} onClick={() => setLeverage(lv)}
              className={[
                'flex-1 py-1 text-[9px] font-mono rounded border transition-colors duration-100',
                leverage === lv ? sideActive : btnInactive,
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
