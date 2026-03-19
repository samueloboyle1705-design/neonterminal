'use client';

/**
 * useTradeOverlays
 *
 * Manages horizontal IPriceLine overlays on an existing Lightweight Charts series
 * for each open simulated position.  Completely decoupled from the chart lifecycle
 * — it receives the series via ref and reconciles purely against the positions list.
 *
 * Design:
 *  - One dashed price line per open position, anchored to entryPrice.
 *  - Long positions → neon-green line; Short → vivid-red line.
 *  - The axis label shows the side, size, and live uPnL (e.g. "L 0.001 +$12.34").
 *  - Reconciliation strategy: the effect diffs current vs. previous using a Map keyed
 *    by positionId.  Lines are created once and updated cheaply via applyOptions()
 *    on every tick — no teardown on markPrice changes, only on position add/close.
 *
 * Stability guarantees:
 *  - Effect deps: [positions, markPrice].  Runs on every tick that has an open position
 *    for the selected symbol (cheap: one applyOptions call per position).
 *  - On symbol switch: positions array changes → stale lines removed, new ones added.
 *  - On component unmount: chart.remove() (in useChart) destroys everything; no
 *    explicit cleanup needed here.
 *  - If series is null (chart not yet mounted): effect is a no-op; the next call with
 *    a valid series will add any necessary lines.
 */

import { useEffect, useRef } from 'react';
import type { ISeriesApi, IPriceLine } from 'lightweight-charts';
import { LineStyle } from 'lightweight-charts';
import type { TradeSide } from '@/types/trading';

// ── Theme constants (must match globals.css @theme values) ───────────────────

const C = {
  green:        '#00e887',
  red:          '#ff3b5c',
  greenDim:     '#00160a',
  redDim:       '#1a040e',
  greenDimText: '#005e2e',   // dimmer label text for green axis
  redDimText:   '#7a1a2e',   // dimmer label text for red axis
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface OverlayPosition {
  id:             string;
  side:           TradeSide;
  size:           number;
  entryPrice:     number;
  unrealizedPnl:  number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildTitle(pos: OverlayPosition): string {
  const sideLabel = pos.side === 'Buy' ? 'L' : 'S';
  const pnlSign   = pos.unrealizedPnl >= 0 ? '+' : '';
  const pnlStr    = `${pnlSign}$${Math.abs(pos.unrealizedPnl).toFixed(2)}`;
  return `${sideLabel} ${pos.size}  ${pnlStr}`;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Sync trade-entry price lines on the given series.
 *
 * @param seriesRef   Ref to the candlestick series (from useChart).
 * @param positions   Open positions for the currently selected symbol only.
 * @param markPrice   Latest mark price — used to trigger PnL label updates.
 */
export function useTradeOverlays(
  seriesRef: React.RefObject<ISeriesApi<'Candlestick'> | null>,
  positions: readonly OverlayPosition[],
  markPrice: number,
): void {
  // Map of positionId → IPriceLine; never triggers re-renders
  const linesRef = useRef<Map<string, IPriceLine>>(new Map());

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const lines       = linesRef.current;
    const currentIds  = new Set(positions.map((p) => p.id));

    // ── 1. Remove lines for positions that are no longer open ────────────────
    for (const [id, line] of lines) {
      if (!currentIds.has(id)) {
        try { series.removePriceLine(line); } catch { /* series may be transitioning */ }
        lines.delete(id);
      }
    }

    // ── 2. Add new lines / update existing labels ────────────────────────────
    for (const pos of positions) {
      const isLong = pos.side === 'Buy';
      const color   = isLong ? C.green : C.red;
      const dimBg   = isLong ? C.greenDim : C.redDim;
      const title   = buildTitle(pos);

      const existing = lines.get(pos.id);
      if (existing) {
        // Only update the label (PnL changes on every tick); price never moves
        existing.applyOptions({ title });
      } else {
        // First time we see this position — create the price line
        try {
          const line = series.createPriceLine({
            price:              pos.entryPrice,
            color,
            lineWidth:          1,
            lineStyle:          LineStyle.Dashed,
            axisLabelVisible:   true,
            axisLabelColor:     dimBg,
            axisLabelTextColor: color,
            title,
          });
          lines.set(pos.id, line);
        } catch {
          // Silently ignore — can happen during symbol/timeframe transitions
        }
      }
    }
    // markPrice is intentionally in deps to trigger PnL-label refresh on ticks,
    // even when positions array reference is stable.
  }, [seriesRef, positions, markPrice]); // eslint-disable-line react-hooks/exhaustive-deps
}
