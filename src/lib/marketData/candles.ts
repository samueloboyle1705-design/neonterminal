import type { Candle, DisplayTimeframe, Timeframe } from './types';
import { normalizeCandle } from './normalize';

// ---------------------------------------------------------------------------
// Timeframe mapping
// ---------------------------------------------------------------------------

/**
 * Maps UI-facing display labels to Bybit v5 interval strings.
 * Bybit numeric intervals are in minutes; 'D' is daily.
 */
export const TIMEFRAME_MAP: Record<DisplayTimeframe, Timeframe> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1d': 'D',
};

export function displayTimeframeToBybit(tf: DisplayTimeframe): Timeframe {
  return TIMEFRAME_MAP[tf];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BYBIT_REST_BASE = 'https://api.bybit.com/v5';
const MAX_LIMIT = 1000;

// ---------------------------------------------------------------------------
// Raw response shape
// ---------------------------------------------------------------------------

/** Permissive type — Bybit may return unexpected shapes; we validate at runtime. */
interface BybitKlineResponse {
  retCode?: number;
  retMsg?: string;
  result?: {
    symbol?: string;
    category?: string;
    list?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch historical OHLCV candles from Bybit v5 REST.
 *
 * @param symbol      Bybit instrument name, e.g. "BTCUSDT"
 * @param timeframe   UI display timeframe, e.g. "1h"
 * @param limit       Number of candles requested (capped at 1 000 by Bybit)
 * @returns           Candles sorted oldest → newest, ready for lightweight-charts.
 *                    Returns [] on empty or fully-malformed responses.
 * @throws            On HTTP errors or Bybit API-level errors (retCode ≠ 0).
 */
export async function fetchCandles(
  symbol: string,
  timeframe: DisplayTimeframe,
  limit: number,
): Promise<Candle[]> {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('fetchCandles: symbol must be a non-empty string');
  }

  const clampedLimit = Math.max(1, Math.min(Math.floor(limit), MAX_LIMIT));
  const bybitInterval = displayTimeframeToBybit(timeframe);

  const url = new URL(`${BYBIT_REST_BASE}/market/kline`);
  url.searchParams.set('category', 'linear');
  url.searchParams.set('symbol', symbol.toUpperCase());
  url.searchParams.set('interval', bybitInterval);
  url.searchParams.set('limit', String(clampedLimit));

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: 'no-store' });
  } catch (networkErr) {
    throw new Error(
      `fetchCandles: network error for ${symbol} ${timeframe}: ${String(networkErr)}`,
    );
  }

  if (!res.ok) {
    throw new Error(
      `fetchCandles: HTTP ${res.status} ${res.statusText} for ${symbol} ${timeframe}`,
    );
  }

  let json: BybitKlineResponse;
  try {
    json = (await res.json()) as BybitKlineResponse;
  } catch {
    throw new Error(`fetchCandles: response for ${symbol} ${timeframe} was not valid JSON`);
  }

  // Bybit signals API-level failures via retCode ≠ 0.
  if (json.retCode !== undefined && json.retCode !== 0) {
    throw new Error(
      `fetchCandles: Bybit error ${json.retCode}: ${json.retMsg ?? 'unknown'} for ${symbol} ${timeframe}`,
    );
  }

  // Guard the result container.
  const list = json.result?.list;
  if (!Array.isArray(list)) {
    // Empty/missing list — treat as zero candles rather than an error.
    return [];
  }

  if (list.length === 0) return [];

  // Normalize each item; skip any that fail validation (filter out nulls).
  const candles: Candle[] = [];
  for (const item of list) {
    const candle = normalizeCandle(item);
    if (candle !== null) {
      candles.push(candle);
    }
  }

  // Bybit returns newest-first; reverse so index 0 is the oldest candle.
  candles.reverse();

  return candles;
}
