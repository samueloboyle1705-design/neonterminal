/**
 * Human-readable timeframe labels used throughout the UI.
 * These are mapped to Bybit interval strings internally.
 */
export type DisplayTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

/**
 * Raw Bybit v5 interval strings.
 * Numeric strings are minutes; D/W/M are day/week/month.
 * Kept for internal use and for callers that query Bybit directly.
 */
export type Timeframe =
  | '1'
  | '3'
  | '5'
  | '15'
  | '30'
  | '60'
  | '120'
  | '240'
  | '360'
  | '720'
  | 'D'
  | 'W'
  | 'M';

/** Symbols explicitly supported and tested by this app. */
export const SUPPORTED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

/** A single OHLCV candle, time in Unix seconds (matches lightweight-charts). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Normalised real-time ticker snapshot for one symbol. */
export interface MarketTick {
  symbol: string;
  lastPrice: number;
  markPrice: number;
  indexPrice: number;
  bid: number;
  ask: number;
  volume24h: number;
  turnover24h: number;
  /** Absolute price change over last 24 h. */
  priceChange24h: number;
  /** Fractional change, e.g. 0.012 = +1.2 %. */
  priceChangePct24h: number;
  fundingRate: number;
  /** Epoch ms of next funding settlement. */
  nextFundingTime: number;
  openInterest: number;
  /** Epoch ms when this tick was emitted by the exchange. */
  timestamp: number;
}

/** Best bid/ask with sizes from the order book. */
export interface OrderBookTop {
  symbol: string;
  /** [price, size] pairs, best bid first. */
  bids: [number, number][];
  /** [price, size] pairs, best ask first. */
  asks: [number, number][];
  timestamp: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
