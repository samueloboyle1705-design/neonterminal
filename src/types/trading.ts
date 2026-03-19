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
  /** Unix-ms timestamp when the position was opened. */
  openedAt: number;
  /** Optional stop-loss price set at order time. */
  slPrice?: number;
  /** Optional take-profit price set at order time. */
  tpPrice?: number;
}

// ---------------------------------------------------------------------------
// Closed Trade (trade history record)
// ---------------------------------------------------------------------------

/**
 * Immutable record written each time a position (or portion of one) is closed.
 * Used to build trade history, win/loss stats, and account attribution.
 */
export interface ClosedTrade {
  /** Unique record ID (generated at close time). */
  id: string;
  /** The position this close belongs to. */
  positionId: string;
  symbol: string;
  side: TradeSide;
  /** Unix-ms when the position was originally opened. */
  openedAt: number;
  /** Unix-ms when this close happened. */
  closedAt: number;
  entryPrice: number;
  /** Mark price at the moment of close. */
  exitPrice: number;
  /** Quantity closed in this record (may be < full position for partial closes). */
  size: number;
  realizedPnl: number;
  /** SL set on the position at close time (for record keeping). */
  slPrice?: number;
  /** TP set on the position at close time. */
  tpPrice?: number;
  /** True when only part of the position was closed. */
  isPartial: boolean;
  /** Why the position (or portion) was closed. */
  exitReason: 'manual' | 'stop-loss' | 'take-profit' | 'partial';
}

// ---------------------------------------------------------------------------
// Pending Order (simulated limit / stop orders waiting for price trigger)
// ---------------------------------------------------------------------------

export type PendingOrderType = 'Limit' | 'Stop';

export interface PendingOrder {
  id: string;
  symbol: string;
  side: TradeSide;
  orderType: PendingOrderType;
  size: number;
  triggerPrice: number;
  leverage: number;
  slPrice?: number;
  tpPrice?: number;
  createdAt: number;
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
