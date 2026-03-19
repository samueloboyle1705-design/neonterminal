// Public surface of the market-data module.
// Import from '@/lib/marketData' — never from internal files directly.

export type {
  Candle,
  MarketTick,
  OrderBookTop,
  ConnectionStatus,
  Timeframe,
  DisplayTimeframe,
  SupportedSymbol,
} from './types';
export { SUPPORTED_SYMBOLS } from './types';

export type { MarketDataProvider } from './provider';

export { fetchCandles, displayTimeframeToBybit, TIMEFRAME_MAP } from './candles';

export { normalizeCandle, normalizeTicker } from './normalize';
export type { BybitKlineItem, BybitRawTicker, BybitTickerEnvelope } from './normalize';

export { BybitStream } from './stream';

export { BybitProvider, getBybitProvider, destroyBybitProvider } from './bybit';
