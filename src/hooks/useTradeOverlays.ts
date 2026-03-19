'use client';

/**
 * useTradeOverlays
 *
 * Manages IPriceLine overlays on an existing Lightweight Charts series for each
 * open simulated position.  Each position produces up to three lines:
 *
 *   entry  — dashed, side-colored (green for Long, red for Short)
 *            label: "L 0.001  +$12.34" (live uPnL)
 *   SL     — sparse-dotted, always red
 *            label: "SL  -$120.50" (estimated loss at SL)
 *   TP     — sparse-dotted, always green
 *            label: "TP  +$240.00" (estimated gain at TP)
 *
 * Line keys in the internal Map are "${positionId}:entry", "${positionId}:sl",
 * and "${positionId}:tp".  This lets each kind of line be created, updated, or
 * removed independently.
 *
 * Stability guarantees:
 *  - Entry and SL/TP lines are created once; only the label is updated on ticks.
 *  - When a position is closed the key disappears from validKeys → the line is
 *    removed exactly once.
 *  - On symbol / timeframe switch: positions array reference changes → stale keys
 *    are pruned; new positions get fresh lines.
 *  - If series is null (chart not yet mounted): effect is a no-op; next call with
 *    a valid series will add all necessary lines.
 */

import { useEffect, useRef } from 'react';
import type { ISeriesApi, IPriceLine } from 'lightweight-charts';
import { LineStyle } from 'lightweight-charts';
import type { TradeSide } from '@/types/trading';

// ── Theme constants (must match globals.css @theme) ──────────────────────────

const C = {
  green:    '#00e887',
  red:      '#ff3b5c',
  greenDim: '#00160a',
  redDim:   '#1a040e',
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface OverlayPosition {
  id:            string;
  side:          TradeSide;
  size:          number;
  entryPrice:    number;
  unrealizedPnl: number;
  /** Stop-loss price.  Line is omitted when absent or 0. */
  slPrice?:      number;
  /** Take-profit price.  Line is omitted when absent or 0. */
  tpPrice?:      number;
}

// ── Label builders ───────────────────────────────────────────────────────────

function entryLabel(pos: OverlayPosition): string {
  const side = pos.side === 'Buy' ? 'L' : 'S';
  const sign = pos.unrealizedPnl >= 0 ? '+' : '';
  return `${side} ${pos.size}  ${sign}$${Math.abs(pos.unrealizedPnl).toFixed(2)}`;
}

function slLabel(pos: OverlayPosition): string {
  if (!pos.slPrice) return 'SL';
  const isLong = pos.side === 'Buy';
  const pnl = isLong
    ? pos.size * (pos.slPrice - pos.entryPrice)  // negative — SL below entry for long
    : pos.size * (pos.entryPrice - pos.slPrice); // negative — SL above entry for short
  const sign = pnl >= 0 ? '+' : '';
  return `SL  ${sign}$${Math.abs(pnl).toFixed(2)}`;
}

function tpLabel(pos: OverlayPosition): string {
  if (!pos.tpPrice) return 'TP';
  const isLong = pos.side === 'Buy';
  const pnl = isLong
    ? pos.size * (pos.tpPrice - pos.entryPrice)  // positive — TP above entry for long
    : pos.size * (pos.entryPrice - pos.tpPrice); // positive — TP below entry for short
  const sign = pnl >= 0 ? '+' : '';
  return `TP  ${sign}$${Math.abs(pnl).toFixed(2)}`;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Sync entry / SL / TP price lines on the given series.
 *
 * @param seriesRef   Ref to the candlestick series (from useChart).
 * @param positions   Open positions for the currently selected symbol only.
 * @param markPrice   Latest mark price — triggers PnL-label refresh on every tick.
 */
export function useTradeOverlays(
  seriesRef: React.RefObject<ISeriesApi<'Candlestick'> | null>,
  positions: readonly OverlayPosition[],
  markPrice: number,
): void {
  // Map of "${positionId}:{entry|sl|tp}" → IPriceLine.  Never triggers re-renders.
  const linesRef = useRef<Map<string, IPriceLine>>(new Map());

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const lines = linesRef.current;

    // Build the complete set of keys that should exist for current positions
    const validKeys = new Set<string>();
    for (const pos of positions) {
      validKeys.add(`${pos.id}:entry`);
      if (pos.slPrice && pos.slPrice > 0) validKeys.add(`${pos.id}:sl`);
      if (pos.tpPrice && pos.tpPrice > 0) validKeys.add(`${pos.id}:tp`);
    }

    // ── 1. Remove any line whose key is no longer in validKeys ───────────────
    for (const [key, line] of lines) {
      if (!validKeys.has(key)) {
        try { series.removePriceLine(line); } catch { /* series may be mid-transition */ }
        lines.delete(key);
      }
    }

    // ── 2. Add new lines / update labels for existing ones ───────────────────
    for (const pos of positions) {
      const isLong = pos.side === 'Buy';
      const entryColor = isLong ? C.green : C.red;
      const entryBg    = isLong ? C.greenDim : C.redDim;

      // ── Entry ──────────────────────────────────────────────────────────────
      const entryKey   = `${pos.id}:entry`;
      const entryTitle = entryLabel(pos);
      const existEntry = lines.get(entryKey);
      if (existEntry) {
        existEntry.applyOptions({ title: entryTitle });
      } else {
        try {
          const line = series.createPriceLine({
            price:              pos.entryPrice,
            color:              entryColor,
            lineWidth:          1,
            lineStyle:          LineStyle.Dashed,
            axisLabelVisible:   true,
            axisLabelColor:     entryBg,
            axisLabelTextColor: entryColor,
            title:              entryTitle,
          });
          lines.set(entryKey, line);
        } catch { /* ignore during symbol/tf transitions */ }
      }

      // ── Stop Loss ──────────────────────────────────────────────────────────
      if (pos.slPrice && pos.slPrice > 0) {
        const slKey   = `${pos.id}:sl`;
        const slTitle = slLabel(pos);
        const existSl = lines.get(slKey);
        if (existSl) {
          existSl.applyOptions({ title: slTitle });
        } else {
          try {
            const line = series.createPriceLine({
              price:              pos.slPrice,
              color:              C.red,
              lineWidth:          1,
              lineStyle:          LineStyle.SparseDotted,
              axisLabelVisible:   true,
              axisLabelColor:     C.redDim,
              axisLabelTextColor: C.red,
              title:              slTitle,
            });
            lines.set(slKey, line);
          } catch {}
        }
      }

      // ── Take Profit ────────────────────────────────────────────────────────
      if (pos.tpPrice && pos.tpPrice > 0) {
        const tpKey   = `${pos.id}:tp`;
        const tpTitle = tpLabel(pos);
        const existTp = lines.get(tpKey);
        if (existTp) {
          existTp.applyOptions({ title: tpTitle });
        } else {
          try {
            const line = series.createPriceLine({
              price:              pos.tpPrice,
              color:              C.green,
              lineWidth:          1,
              lineStyle:          LineStyle.SparseDotted,
              axisLabelVisible:   true,
              axisLabelColor:     C.greenDim,
              axisLabelTextColor: C.green,
              title:              tpTitle,
            });
            lines.set(tpKey, line);
          } catch {}
        }
      }
    }

    // markPrice is in deps to trigger label refresh on every tick even when the
    // positions array reference is stable (PnL changes on live ticks).
  }, [seriesRef, positions, markPrice]); // eslint-disable-line react-hooks/exhaustive-deps
}
