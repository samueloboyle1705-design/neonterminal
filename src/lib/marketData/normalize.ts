import type { Candle, MarketTick } from './types';

// ---------------------------------------------------------------------------
// Raw Bybit shapes (REST + WebSocket)
// ---------------------------------------------------------------------------

/**
 * Bybit v5 kline list item.
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

/** Convert a raw Bybit kline array into a shared Candle. */
export function normalizeCandle(item: BybitKlineItem): Candle {
  return {
    // Bybit timestamps are epoch ms; lightweight-charts wants epoch seconds.
    time: Math.floor(Number(item[0]) / 1000),
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4]),
    volume: Number(item[5]),
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
