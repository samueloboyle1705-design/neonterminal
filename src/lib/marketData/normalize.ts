import type { Candle, MarketTick } from './types';

// ---------------------------------------------------------------------------
// Raw Bybit shapes (REST + WebSocket)
// ---------------------------------------------------------------------------

/**
 * Bybit v5 kline list item shape (informational — actual parsing uses
 * unknown[] so callers do not need to pre-cast before calling normalizeCandle).
 * [startTime, open, high, low, close, volume, turnover]
 */
export type BybitKlineItem = [
  string, // 0 startTime (epoch ms)
  string, // 1 open
  string, // 2 high
  string, // 3 low
  string, // 4 close
  string, // 5 volume (base asset)
  string, // 6 turnover (quote asset)
];

/**
 * Bybit v5 ticker data payload.
 * All number-valued fields arrive as strings.
 * Delta updates may omit unchanged fields.
 */
export interface BybitRawTicker {
  symbol: string;
  lastPrice: string;
  markPrice?: string;
  indexPrice?: string;
  bid1Price?: string;
  ask1Price?: string;
  volume24h?: string;
  turnover24h?: string;
  /** Fractional 24 h price change, e.g. "0.0123" = +1.23 %. */
  price24hPcnt?: string;
  /** Price 24 h ago — present in snapshots. */
  prevPrice24h?: string;
  fundingRate?: string;
  nextFundingTime?: string;
  openInterest?: string;
}

/** Wrapper emitted by the WebSocket handler to callbacks. */
export interface BybitTickerEnvelope {
  data: BybitRawTicker;
  ts: number;
  type: 'snapshot' | 'delta';
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Convert a raw Bybit kline array into a shared Candle.
 *
 * Returns `null` if the item is structurally wrong or contains non-finite
 * values for any price field (NaN / Infinity).  Volume defaults to 0 if
 * missing or non-finite — a missing volume is recoverable, a missing price
 * is not.
 */
export function normalizeCandle(item: unknown): Candle | null {
  // Guard: must be an array with at least 6 elements.
  if (!Array.isArray(item) || item.length < 6) return null;

  const time = Math.floor(Number(item[0]) / 1000);
  const open = Number(item[1]);
  const high = Number(item[2]);
  const low = Number(item[3]);
  const close = Number(item[4]);
  const volume = Number(item[5]);

  // A non-positive or non-finite timestamp means the candle is unusable.
  if (!Number.isFinite(time) || time <= 0) return null;

  // Price fields must all be finite numbers.
  if (
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close)
  ) {
    return null;
  }

  return {
    time,
    open,
    high,
    low,
    close,
    volume: Number.isFinite(volume) ? volume : 0,
  };
}

/** Convert a Bybit ticker payload into a shared MarketTick. */
export function normalizeTicker(raw: BybitRawTicker, ts: number): MarketTick {
  const lastPrice = Number(raw.lastPrice);
  const prevPrice24h = raw.prevPrice24h ? Number(raw.prevPrice24h) : 0;
  const pricePct = raw.price24hPcnt ? Number(raw.price24hPcnt) : 0;

  // Prefer prevPrice24h for the absolute delta; fall back to pct-derived value.
  const priceChange24h =
    prevPrice24h > 0 ? lastPrice - prevPrice24h : lastPrice * pricePct;

  return {
    symbol: raw.symbol,
    lastPrice,
    markPrice: raw.markPrice ? Number(raw.markPrice) : lastPrice,
    indexPrice: raw.indexPrice ? Number(raw.indexPrice) : lastPrice,
    bid: raw.bid1Price ? Number(raw.bid1Price) : 0,
    ask: raw.ask1Price ? Number(raw.ask1Price) : 0,
    volume24h: raw.volume24h ? Number(raw.volume24h) : 0,
    turnover24h: raw.turnover24h ? Number(raw.turnover24h) : 0,
    priceChange24h,
    priceChangePct24h: pricePct,
    fundingRate: raw.fundingRate ? Number(raw.fundingRate) : 0,
    nextFundingTime: raw.nextFundingTime ? Number(raw.nextFundingTime) : 0,
    openInterest: raw.openInterest ? Number(raw.openInterest) : 0,
    timestamp: ts,
  };
}
