'use client';

/**
 * useTradeOverlays
 *
 * Manages IPriceLine overlays (entry / SL / TP) for open positions AND wires
 * a click-to-arm / crosshair-drag / click-to-commit interaction for SL and TP
 * lines directly on the chart.
 *
 * ── Overlay lines ──────────────────────────────────────────────────────────
 *  entry  dashed,        side-colored (green Long / red Short), live uPnL label
 *  SL     sparse-dotted, red,   "SL  -$120.50" (estimated loss)
 *  TP     sparse-dotted, green, "TP  +$240.00" (estimated gain)
 *
 *  Each line is given an `id` matching its map key so the chart can report
 *  `hoveredObjectId` for hit-testing.
 *
 * ── Drag interaction ───────────────────────────────────────────────────────
 *  Lightweight Charts v5 has no native price-line drag API.  The strongest
 *  available substitute uses the exposed event subscriptions:
 *
 *   subscribeCrosshairMove  — fires on every mouse-move; provides `point.y`
 *                             (pixel coordinate) and `hoveredObjectId`.
 *   subscribeClick          — fires on click; provides same fields.
 *   series.coordinateToPrice(y) — converts pixel y to price.
 *   PriceLineOptions.id     — unique ID that appears in hoveredObjectId when
 *                             that line is under the cursor.
 *
 *  Interaction model ("click-to-grab, crosshair-drag, click-to-drop"):
 *   1. Move cursor over an SL or TP line → line widens (lineWidth 2) +
 *      container shows ns-resize cursor.
 *   2. Click the line → "arm" it.  Armed line becomes solid; hint banner
 *      appears; cursor becomes crosshair.
 *   3. Move cursor — armed line follows in real-time (live preview).
 *   4. Click anywhere → validate + commit via updatePositionSlTp.
 *      If invalid → revert to original price and show error hint.
 *   5. Esc → cancel; line reverts.
 *
 * ── Stability ─────────────────────────────────────────────────────────────
 *  Overlay effect  deps: [positions, markPrice]
 *  Drag effect     deps: [chartRef, seriesRef]  (re-subscribe only on mount)
 *  Both effects read positions from linesRef / store at runtime — no stale
 *  closure issues.  Armed state is in a ref (never triggers React re-render).
 *  Cursor + hint DOM manipulations bypass React entirely.
 */

import { useEffect, useRef } from 'react';
import type { IChartApi, ISeriesApi, IPriceLine, MouseEventParams } from 'lightweight-charts';
import { LineStyle } from 'lightweight-charts';
import type { TradeSide } from '@/types/trading';
import { useTerminalStore } from '@/stores/terminal-store';
import { updatePositionSlTp } from '@/lib/trading/simulator';

// ── Theme constants ────────────────────────────────────────────────────────

const C = {
  green:    '#00e887',
  red:      '#ff3b5c',
  greenDim: '#00160a',
  redDim:   '#1a040e',
  cyan:     '#22d3ee',
} as const;

// ── Public types ───────────────────────────────────────────────────────────

export interface OverlayPosition {
  id:            string;
  side:          TradeSide;
  size:          number;
  entryPrice:    number;
  unrealizedPnl: number;
  slPrice?:      number;
  tpPrice?:      number;
}

// ── Internal types ─────────────────────────────────────────────────────────

interface ArmedState {
  /** Map key + price-line id, e.g. "BTCUSDT-Buy:sl" */
  lineKey:    string;
  posId:      string;
  type:       'sl' | 'tp';
  origPrice:  number;
}

// ── Label builders ─────────────────────────────────────────────────────────

function entryLabel(pos: OverlayPosition): string {
  const side = pos.side === 'Buy' ? 'L' : 'S';
  const sign = pos.unrealizedPnl >= 0 ? '+' : '';
  return `${side} ${pos.size}  ${sign}$${Math.abs(pos.unrealizedPnl).toFixed(2)}`;
}

function slLabel(pos: OverlayPosition): string {
  if (!pos.slPrice) return 'SL';
  const isLong = pos.side === 'Buy';
  const pnl = isLong
    ? pos.size * (pos.slPrice - pos.entryPrice)
    : pos.size * (pos.entryPrice - pos.slPrice);
  const sign = pnl >= 0 ? '+' : '';
  return `SL  ${sign}$${Math.abs(pnl).toFixed(2)}`;
}

function tpLabel(pos: OverlayPosition): string {
  if (!pos.tpPrice) return 'TP';
  const isLong = pos.side === 'Buy';
  const pnl = isLong
    ? pos.size * (pos.tpPrice - pos.entryPrice)
    : pos.size * (pos.entryPrice - pos.tpPrice);
  const sign = pnl >= 0 ? '+' : '';
  return `TP  ${sign}$${Math.abs(pnl).toFixed(2)}`;
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * @param chartRef       Chart instance ref (from useChart) — for event subscriptions.
 * @param seriesRef      Candlestick series ref — for price-line creation and coordinate conversion.
 * @param containerRef   Chart container div — for cursor style changes.
 * @param hintRef        Optional overlay <div> in which drag hints are written directly (no React state).
 * @param positions      Open positions for the selected symbol only.
 * @param markPrice      Latest mark price — triggers label refresh on every tick.
 */
export function useTradeOverlays(
  chartRef:      React.RefObject<IChartApi | null>,
  seriesRef:     React.RefObject<ISeriesApi<'Candlestick'> | null>,
  containerRef:  React.RefObject<HTMLDivElement | null>,
  hintRef:       React.RefObject<HTMLDivElement | null>,
  positions:     readonly OverlayPosition[],
  markPrice:     number,
): void {
  // Map of lineKey → IPriceLine; never triggers re-renders
  const linesRef = useRef<Map<string, IPriceLine>>(new Map());
  // Armed drag state — stored in a ref so updates never cause re-renders
  const armedRef = useRef<ArmedState | null>(null);

  // ── Effect 1: overlay reconciliation ─────────────────────────────────────
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const lines = linesRef.current;

    // Which line keys should exist for the current position set
    const validKeys = new Set<string>();
    for (const pos of positions) {
      validKeys.add(`${pos.id}:entry`);
      if (pos.slPrice && pos.slPrice > 0) validKeys.add(`${pos.id}:sl`);
      if (pos.tpPrice && pos.tpPrice > 0) validKeys.add(`${pos.id}:tp`);
    }

    // Remove stale lines; cancel armed state if its line was removed
    for (const [key, line] of lines) {
      if (!validKeys.has(key)) {
        try { series.removePriceLine(line); } catch { /* mid-transition */ }
        lines.delete(key);
        if (armedRef.current?.lineKey === key) armedRef.current = null;
      }
    }

    // Add or update each line
    for (const pos of positions) {
      const isLong     = pos.side === 'Buy';
      const entryColor = isLong ? C.green : C.red;
      const entryBg    = isLong ? C.greenDim : C.redDim;

      // Entry ────────────────────────────────────────────────────────────────
      const entryKey   = `${pos.id}:entry`;
      const entryTitle = entryLabel(pos);
      const existEntry = lines.get(entryKey);
      if (existEntry) {
        existEntry.applyOptions({ title: entryTitle });
      } else {
        try {
          const line = series.createPriceLine({
            id:                 entryKey,
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
        } catch { /* ignore during transitions */ }
      }

      // SL ───────────────────────────────────────────────────────────────────
      if (pos.slPrice && pos.slPrice > 0) {
        const slKey   = `${pos.id}:sl`;
        const slTitle = slLabel(pos);
        const existSl = lines.get(slKey);
        if (existSl) {
          // Only update label if this line isn't mid-drag (to avoid fighting user)
          if (armedRef.current?.lineKey !== slKey) {
            existSl.applyOptions({ title: slTitle, price: pos.slPrice });
          }
        } else {
          try {
            const line = series.createPriceLine({
              id:                 slKey,
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

      // TP ───────────────────────────────────────────────────────────────────
      if (pos.tpPrice && pos.tpPrice > 0) {
        const tpKey   = `${pos.id}:tp`;
        const tpTitle = tpLabel(pos);
        const existTp = lines.get(tpKey);
        if (existTp) {
          if (armedRef.current?.lineKey !== tpKey) {
            existTp.applyOptions({ title: tpTitle, price: pos.tpPrice });
          }
        } else {
          try {
            const line = series.createPriceLine({
              id:                 tpKey,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesRef, positions, markPrice]);

  // ── Effect 2: drag interaction ────────────────────────────────────────────
  // Only re-runs when the chart or series instance changes (i.e. on mount).
  // Reads positions and lines at event-handler runtime — no stale closures.
  useEffect(() => {
    const chart  = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    // Capture non-null locals for use inside closures (TypeScript nullability)
    const chartNN  = chart;
    const seriesNN = series;

    const lines     = linesRef.current;
    const container = containerRef.current;
    const hint      = hintRef.current;

    // ── helpers ──────────────────────────────────────────────────────────────

    function setHint(text: string | null) {
      if (!hint) return;
      if (text) {
        hint.textContent = text;
        hint.style.display = 'block';
      } else {
        hint.style.display = 'none';
      }
    }

    function setCursor(style: string) {
      if (container) container.style.cursor = style;
    }

    function resetLineStyle(lineKey: string) {
      const line = lines.get(lineKey);
      if (!line) return;
      const isSl = lineKey.includes(':sl');
      const isTp = lineKey.includes(':tp');
      if (isSl || isTp) {
        line.applyOptions({
          lineWidth: 1,
          lineStyle: LineStyle.SparseDotted,
          color:     isSl ? C.red : C.green,
        });
      }
    }

    function armLineStyle(lineKey: string) {
      const line = lines.get(lineKey);
      if (!line) return;
      const isSl = lineKey.includes(':sl');
      line.applyOptions({
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        color:     isSl ? C.red : C.green,
      });
    }

    function disarm(revert = false) {
      const armed = armedRef.current;
      if (!armed) return;
      if (revert) {
        const line = lines.get(armed.lineKey);
        if (line) line.applyOptions({ price: armed.origPrice });
      }
      resetLineStyle(armed.lineKey);
      armedRef.current = null;
      setHint(null);
      setCursor('');
    }

    // ── crosshair handler ────────────────────────────────────────────────────
    function onCrosshairMove(param: MouseEventParams) {
      const armed     = armedRef.current;
      const hoveredId = param.hoveredObjectId as string | undefined;

      // While armed: move the line to cursor price (live preview)
      if (armed) {
        if (param.point) {
          const price = seriesNN.coordinateToPrice(param.point.y);
          if (price !== null && price > 0) {
            const line = lines.get(armed.lineKey);
            if (line) {
              const label = armed.type === 'sl'
                ? `SL ← ${price.toFixed(2)}`
                : `TP ← ${price.toFixed(2)}`;
              line.applyOptions({ price, title: label });
            }
          }
        }
        return; // Don't change hover highlight while armed
      }

      // Not armed — highlight SL/TP lines on hover
      for (const [key] of lines) {
        if (!key.includes(':sl') && !key.includes(':tp')) continue;
        const isHovered = key === hoveredId;
        const line = lines.get(key);
        if (!line) continue;
        const isSl = key.includes(':sl');
        line.applyOptions({
          lineWidth: isHovered ? 2 : 1,
          color:     isSl ? C.red : C.green,
        });
      }

      // Cursor feedback
      const isOverSlTp = hoveredId
        ? (hoveredId.includes(':sl') || hoveredId.includes(':tp'))
        : false;
      setCursor(isOverSlTp ? 'ns-resize' : '');
    }

    // ── click handler ────────────────────────────────────────────────────────
    function onClick(param: MouseEventParams) {
      const armed     = armedRef.current;
      const hoveredId = param.hoveredObjectId as string | undefined;

      // ── Commit armed line ──────────────────────────────────────────────────
      if (armed) {
        const line = lines.get(armed.lineKey);
        if (!line) { disarm(); return; }

        const committedPrice = line.options().price;

        // Read fresh position from store (never stale)
        const { positions: storePositions } = useTerminalStore.getState();
        const pos = storePositions.find((p) => p.id === armed.posId);
        if (!pos) { disarm(); return; }

        const newSl = armed.type === 'sl' ? committedPrice : (pos.slPrice ?? null);
        const newTp = armed.type === 'tp' ? committedPrice : (pos.tpPrice ?? null);

        const result = updatePositionSlTp(armed.posId, newSl, newTp);
        if (!result.ok) {
          setHint(`✕  ${result.error}`);
          setTimeout(() => disarm(true), 1_200);
          return;
        }

        disarm();
        return;
      }

      // ── Arm a SL / TP line if one is hovered ─────────────────────────────
      if (!hoveredId) return;
      const isSl = hoveredId.endsWith(':sl');
      const isTp = hoveredId.endsWith(':tp');
      if (!isSl && !isTp) return;

      const posId = hoveredId.slice(0, -(isSl ? 3 : 3)); // remove ":sl" / ":tp"
      const line  = lines.get(hoveredId);
      if (!line) return;

      armedRef.current = {
        lineKey:   hoveredId,
        posId,
        type:      isSl ? 'sl' : 'tp',
        origPrice: line.options().price,
      };
      armLineStyle(hoveredId);
      setHint(`Adjusting ${isSl ? 'SL' : 'TP'} — click to commit · Esc to cancel`);
      setCursor('crosshair');
    }

    // ── keyboard cancel ──────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') disarm(true);
    }

    chartNN.subscribeCrosshairMove(onCrosshairMove);
    chartNN.subscribeClick(onClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      chartNN.unsubscribeCrosshairMove(onCrosshairMove);
      chartNN.unsubscribeClick(onClick);
      document.removeEventListener('keydown', onKeyDown);
      // Disarm without revert (chart is likely transitioning)
      armedRef.current = null;
      setHint(null);
      setCursor('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, seriesRef]);
}
