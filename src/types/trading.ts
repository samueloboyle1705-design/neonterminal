/**
 * Trading domain types shared between stores and UI components.
 * Separate from src/lib/marketData to keep market-data concerns clean.
 */

// ---------------------------------------------------------------------------
// Position
// ---------------------------------------------------------------------------

export type TradeSide = 'Buy' | 'Sell';

/**
 * An open perpetual futures position.
 * Mirrors the Bybit v5 position structure; non-numeric fields kept as strings.
 */
export interface Position {
  /** Bybit's unique position identifier (symbol + side key). */
  id: string;
  symbol: string;
  side: TradeSide;
  /** Contract quantity (base asset). */
  size: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  /** Isolated-margin leverage, e.g. 10 = 10×. */
  leverage: number;
  /** Optional stop-loss price set at order time. */
  slPrice?: number;
  /** Optional take-profit price set at order time. */
  tpPrice?: number;
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export type OrderType = 'Market' | 'Limit' | 'StopMarket' | 'StopLimit';

export type OrderStatus =
  | 'New'
  | 'PartiallyFilled'
  | 'Filled'
  | 'Cancelled'
  | 'Rejected';

export interface Order {
  id: string;
  symbol: string;
  side: TradeSide;
  type: OrderType;
  /** Total order quantity. */
  qty: number;
  /** Filled quantity so far. */
  filledQty: number;
  /** Limit price (0 for market orders). */
  price: number;
  status: OrderStatus;
  /** Unix ms. */
  createdAt: number;
}
