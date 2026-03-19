import type { Candle, Timeframe } from './types';
import type { BybitKlineItem } from './normalize';
import { normalizeCandle } from './normalize';

const BYBIT_REST_BASE = 'https://api.bybit.com/v5';
const MAX_LIMIT = 1000;

interface BybitKlineResponse {
  retCode: number;
  retMsg: string;
  result: {
    symbol: string;
    category: string;
    list: BybitKlineItem[];
  };
}

/**
 * Fetch historical OHLCV candles from Bybit's REST API.
 *
 * @param symbol   Bybit instrument name, e.g. "BTCUSDT"
 * @param timeframe Interval string understood by Bybit v5 kline endpoint
 * @param limit    Number of candles (capped at 1 000 per Bybit docs)
 * @returns        Candles sorted oldest → newest, ready for lightweight-charts
 */
export async function fetchCandles(
  symbol: string,
  timeframe: Timeframe,
  limit: number,
): Promise<Candle[]> {
  const url = new URL(`${BYBIT_REST_BASE}/market/kline`);
  url.searchParams.set('category', 'linear');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', timeframe);
  url.searchParams.set('limit', String(Math.min(limit, MAX_LIMIT)));

  const res = await fetch(url.toString(), {
    // Disable any framework-level caching so data is always fresh.
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Bybit REST HTTP ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as BybitKlineResponse;

  if (json.retCode !== 0) {
    throw new Error(`Bybit API error ${json.retCode}: ${json.retMsg}`);
  }

  // Bybit returns candles newest-first; reverse so index 0 is the oldest.
  return json.result.list.reverse().map(normalizeCandle);
}
