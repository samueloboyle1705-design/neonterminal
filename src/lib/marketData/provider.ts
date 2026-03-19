import type { Candle, ConnectionStatus, DisplayTimeframe, MarketTick } from './types';

/**
 * Uniform interface for any market-data backend.
 * Swap BybitProvider for another implementation without touching consumers.
 */
export interface MarketDataProvider {
  /**
   * Fetch historical candles for a symbol.
   *
   * @param symbol    Instrument name, e.g. "BTCUSDT"
   * @param timeframe UI display timeframe, e.g. "1h"
   * @param limit     Number of candles (provider may cap this)
   * @returns         Candles sorted oldest → newest, ready for lightweight-charts
   */
  getCandles(
    symbol: string,
    timeframe: DisplayTimeframe,
    limit: number,
  ): Promise<Candle[]>;

  /**
   * Subscribe to real-time ticker updates for one or more symbols.
   * Returns an unsubscribe function; call it to stop receiving updates
   * and release any underlying resources (WebSocket topics, etc.).
   */
  subscribeTicker(symbols: string[], onTick: (tick: MarketTick) => void): () => void;

  /** Current state of the underlying transport (WebSocket, etc.). */
  getConnectionStatus(): ConnectionStatus;

  /** Tear down all connections and free resources. */
  destroy(): void;
}
