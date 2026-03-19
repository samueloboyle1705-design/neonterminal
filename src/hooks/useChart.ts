'use client';

/**
 * useChart — manages a full Lightweight Charts v5 candlestick chart lifecycle.
 *
 * Responsibilities:
 *  - Creates the chart once on mount; destroys it cleanly on unmount.
 *  - Fetches historical candles from Bybit whenever `symbol` or `timeframe`
 *    changes, cancels in-flight fetches to avoid stale updates.
 *  - Exposes loading + error state for overlay UI.
 *  - Responsive: uses chart's built-in `autoSize` (ResizeObserver-based).
 *
 * Usage:
 *   const { containerRef, isLoading, error } = useChart(symbol, timeframe);
 *   return <div ref={containerRef} className="w-full h-full" />;
 */

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  ColorType,
} from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  DeepPartial,
  ChartOptions,
  CandlestickSeriesPartialOptions,
} from 'lightweight-charts';
import { fetchCandles } from '@/lib/marketData';
import type { DisplayTimeframe } from '@/lib/marketData';

// ── Theme constants — must match globals.css @theme values ──────────────────

const C = {
  bg:       '#090b0e',
  panel:    '#0d1117',
  surface:  '#111823',
  border:   '#1c2638',
  borderHi: '#2a3850',
  text:     '#dde2ed',
  sub:      '#7d8a9e',
  muted:    '#3f4d62',
  green:    '#00d97e',
  red:      '#f63d68',
} as const;

// ── Chart + series options ───────────────────────────────────────────────────

const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  autoSize: true,
  layout: {
    background: { type: ColorType.Solid, color: C.bg },
    textColor: C.sub,
    // GeistMono is loaded as a CSS variable; font-family string must match
    // what the browser has registered from the Next.js font loader.
    fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: C.border },
    horzLines: { color: C.border },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      color: C.borderHi,
      labelBackgroundColor: C.surface,
    },
    horzLine: {
      color: C.borderHi,
      labelBackgroundColor: C.surface,
    },
  },
  rightPriceScale: {
    borderColor: C.border,
  },
  timeScale: {
    borderColor: C.border,
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: false,
    fixRightEdge: false,
  },
};

const CANDLE_OPTIONS: CandlestickSeriesPartialOptions = {
  upColor:        C.green,
  downColor:      C.red,
  borderUpColor:  C.green,
  borderDownColor:C.red,
  wickUpColor:    C.green,
  wickDownColor:  C.red,
};

// How many candles to fetch per request (Bybit cap is 1 000)
const CANDLE_LIMIT = 300;

// ── Hook ────────────────────────────────────────────────────────────────────

export interface UseChartResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: string | null;
  candleCount: number;
}

export function useChart(
  symbol: string,
  timeframe: DisplayTimeframe,
): UseChartResult {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable refs — mutated in effects, never cause re-renders
  const chartRef  = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [candleCount, setCandleCount] = useState(0);

  // ── Effect 1: create chart on mount, destroy on unmount ─────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart  = createChart(el, CHART_OPTIONS);
    const series = chart.addSeries(CandlestickSeries, CANDLE_OPTIONS);

    chartRef.current  = chart;
    seriesRef.current = series;

    return () => {
      // Remove listeners and DOM canvas; nullify refs before GC
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []); // intentionally empty — runs once per mount

  // ── Effect 2: load candles whenever symbol or timeframe changes ──────────
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchCandles(symbol, timeframe, CANDLE_LIMIT)
      .then((candles) => {
        if (cancelled) return;

        // Map our Candle[] to CandlestickData<UTCTimestamp>[]
        // time is already epoch seconds — matches UTCTimestamp
        const data: CandlestickData[] = candles.map((c) => ({
          time:  c.time as UTCTimestamp,
          open:  c.open,
          high:  c.high,
          low:   c.low,
          close: c.close,
        }));

        series.setData(data);
        chart.timeScale().fitContent();

        setCandleCount(data.length);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });

    return () => {
      // Mark the in-flight fetch as stale so its .then() becomes a no-op
      cancelled = true;
    };
  }, [symbol, timeframe]);

  return { containerRef, isLoading, error, candleCount };
}
