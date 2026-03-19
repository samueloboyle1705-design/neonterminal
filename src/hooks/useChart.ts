'use client';

/**
 * useChart — manages a full Lightweight Charts v5 candlestick chart lifecycle.
 *
 * Responsibilities:
 *  - Creates the chart once on mount; destroys it cleanly on unmount.
 *  - Fetches historical candles from Bybit whenever `symbol` or `timeframe`
 *    changes; cancels in-flight fetches to avoid stale updates.
 *  - Patches the latest candle in real-time via series.update() when
 *    `latestTick` changes — no series rebuild, no React state churn.
 *  - Responsive: uses the chart's built-in autoSize (ResizeObserver-based).
 *
 * Three independent effects, in order of priority:
 *   1. [mount only]          create chart + series; destroy on unmount.
 *   2. [symbol, timeframe]   fetch historical data; set currentCandleRef.
 *   3. [latestTick]          patch current candle via series.update().
 *
 * Stale-closure strategy:
 *   chartRef, seriesRef, currentCandleRef, timeframeRef are all React refs.
 *   Effects read them at execution time — never captured in closures.
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
import type { Candle, DisplayTimeframe, MarketTick } from '@/lib/marketData';

// ── Theme constants — must match globals.css @theme values ──────────────────

const C = {
  bg:       '#080b10',
  panel:    '#0b0f17',
  surface:  '#0f1520',
  border:   '#1a2535',
  borderHi: '#243448',
  text:     '#e4e9f5',
  sub:      '#8895ab',
  muted:    '#3d4f66',
  green:    '#00e887',
  red:      '#ff3b5c',
} as const;

// ── Chart + series options ───────────────────────────────────────────────────

const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  autoSize: true,
  layout: {
    background: { type: ColorType.Solid, color: C.bg },
    textColor: C.sub,
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
  upColor:         C.green,
  downColor:       C.red,
  borderUpColor:   C.green,
  borderDownColor: C.red,
  wickUpColor:     C.green,
  wickDownColor:   C.red,
  // Show the built-in last-price line as a subtle mark-price reference
  priceLineVisible: true,
  priceLineColor:   C.borderHi,
  priceLineWidth:   1,
};

// How many candles to fetch per request (Bybit cap is 1 000)
const CANDLE_LIMIT = 300;

// ── Timeframe → seconds mapping (for candle bucket calculation) ─────────────

const TIMEFRAME_SECONDS: Record<DisplayTimeframe, number> = {
  '1m':   60,
  '5m':   300,
  '15m':  900,
  '1h':   3_600,
  '4h':   14_400,
  '1d':   86_400,
};

// ── Pure helper: apply one price tick to the live series ────────────────────

/**
 * Merges a single MarketTick into the series without rebuilding it.
 *
 * Algorithm:
 *  - Derive the candle bucket the tick belongs to (floor to timeframe boundary).
 *  - If bucket === current.time  → update H/L/C of the existing candle.
 *  - If bucket >  current.time  → open a brand-new candle at bucket.
 *  - If bucket <  current.time  → tick is older than visible data; discard.
 *
 * series.update() either mutates the last bar (same time) or appends a new
 * one (later time).  It never modifies historical bars.
 *
 * Wrapped in try/catch because lightweight-charts throws on time-order
 * violations that can occur during symbol/timeframe transitions.
 */
function applyTickToSeries(
  tick: MarketTick,
  series: ISeriesApi<'Candlestick'>,
  currentCandleRef: React.MutableRefObject<Candle | null>,
  timeframe: DisplayTimeframe,
): void {
  const current = currentCandleRef.current;
  if (!current) return; // data not yet loaded — discard

  const bucketSecs = TIMEFRAME_SECONDS[timeframe];
  // tick.timestamp is epoch milliseconds (from Bybit WS `ts` field)
  const tickSecs   = Math.floor(tick.timestamp / 1000);
  const bucket     = Math.floor(tickSecs / bucketSecs) * bucketSecs;
  const price      = tick.lastPrice;

  let next: Candle;

  if (bucket === current.time) {
    // Same candle — extend high/low, move close
    next = {
      ...current,
      high:  Math.max(current.high, price),
      low:   Math.min(current.low,  price),
      close: price,
    };
  } else if (bucket > current.time) {
    // New candle period — open fresh bar
    next = {
      time:   bucket,
      open:   price,
      high:   price,
      low:    price,
      close:  price,
      volume: 0,
    };
  } else {
    // Tick is stale (older than last known candle) — discard
    return;
  }

  try {
    series.update({
      time:  next.time as UTCTimestamp,
      open:  next.open,
      high:  next.high,
      low:   next.low,
      close: next.close,
    });
    // Mutate the ref in-place — this never triggers a React re-render
    currentCandleRef.current = next;
  } catch {
    // Silently discard: can happen mid-transition when new historical data
    // is being loaded and the series timeline is temporarily inconsistent.
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export interface UseChartResult {
  containerRef:  React.RefObject<HTMLDivElement | null>;
  /** Direct ref to the candlestick series — used by overlay hooks to attach
   *  price lines without re-entering the chart lifecycle. Read-only externally. */
  seriesRef:     React.RefObject<ISeriesApi<'Candlestick'> | null>;
  isLoading:     boolean;
  error:         string | null;
  candleCount:   number;
  /** Epoch-ms timestamp of the most recent live tick applied to the chart.
   *  null until the first tick arrives after data loads. */
  lastTickTime:  number | null;
}

export function useChart(
  symbol:      string,
  timeframe:   DisplayTimeframe,
  latestTick?: MarketTick | null,
): UseChartResult {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Stable refs — never trigger re-renders ────────────────────────────────
  const chartRef         = useRef<IChartApi | null>(null);
  const seriesRef        = useRef<ISeriesApi<'Candlestick'> | null>(null);
  /** The last known OHLC for the current time bucket. */
  const currentCandleRef = useRef<Candle | null>(null);
  /** Mirrors `timeframe` prop so the tick-handler reads it without closure. */
  const timeframeRef     = useRef<DisplayTimeframe>(timeframe);

  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [candleCount,  setCandleCount]  = useState(0);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);

  // ── Sync timeframe ref whenever prop changes ──────────────────────────────
  // Must run before Effect 2 (data load) so the tick-handler always sees the
  // correct bucket size even during the async fetch window.
  useEffect(() => {
    timeframeRef.current = timeframe;
    // Invalidate current candle so stale ticks are discarded while reloading.
    currentCandleRef.current = null;
  }, [timeframe]);

  // ── Effect 1: create chart on mount, destroy on unmount ──────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart  = createChart(el, CHART_OPTIONS);
    const series = chart.addSeries(CandlestickSeries, CANDLE_OPTIONS);

    chartRef.current  = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []); // intentionally empty — runs once per mount

  // ── Effect 2: load historical candles on symbol / timeframe change ────────
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    // Invalidate the partial-candle tracker so ticks arriving before the new
    // data finishes loading are silently discarded.
    currentCandleRef.current = null;

    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setLastTickTime(null);

    fetchCandles(symbol, timeframe, CANDLE_LIMIT)
      .then((candles) => {
        if (cancelled) return;

        const data: CandlestickData[] = candles.map((c) => ({
          time:  c.time as UTCTimestamp,
          open:  c.open,
          high:  c.high,
          low:   c.low,
          close: c.close,
        }));

        series.setData(data);
        chart.timeScale().fitContent();

        // Seed the partial-candle ref with the last fetched candle so
        // applyTickToSeries has a valid starting point.
        if (candles.length > 0) {
          currentCandleRef.current = candles[candles.length - 1];
        }

        setCandleCount(data.length);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      // Invalidate again in case the fetch completes after a symbol change
      currentCandleRef.current = null;
    };
  }, [symbol, timeframe]);

  // ── Effect 3: patch latest candle with live price tick ────────────────────
  // Runs on every new tick for the selected symbol.
  // All mutable state is read from refs at execution time — no stale closures.
  useEffect(() => {
    if (!latestTick) return;

    const series = seriesRef.current;
    if (!series) return;

    applyTickToSeries(latestTick, series, currentCandleRef, timeframeRef.current);
    setLastTickTime(Date.now());
  }, [latestTick]);

  return { containerRef, seriesRef, isLoading, error, candleCount, lastTickTime };
}
