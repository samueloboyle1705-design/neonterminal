import type { Candle, ConnectionStatus, MarketTick, Timeframe } from './types';

/**
 * Uniform interface for any market-data backend.
 * Swap BybitProvider for another implementation without touching consumers.
 */
export interface MarketDataProvider {
  /**
   * Fetch historical candles for a symbol.
   * Returns candles sorted oldest → newest (ready for lightweight-charts).
   */
  getCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]>;

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
