/**
 * Pure PnL and margin calculation functions for linear (USDT-margined) perps.
 * No side effects — safe to call from anywhere, including server components.
 */

import type { TradeSide } from '@/types/trading';

/**
 * Unrealized PnL for an open position.
 * Long:  size × (markPrice − entryPrice)
 * Short: size × (entryPrice − markPrice)
 */
export function calcUnrealizedPnl(
  side: TradeSide,
  size: number,
  entryPrice: number,
  markPrice: number,
): number {
  return side === 'Buy'
    ? size * (markPrice - entryPrice)
    : size * (entryPrice - markPrice);
}

/**
 * Simplified isolated-margin liquidation price (no maintenance margin).
 * Long:  entryPrice × (1 − 1 / leverage)
 * Short: entryPrice × (1 + 1 / leverage)
 */
export function calcLiquidationPrice(
  side: TradeSide,
  entryPrice: number,
  leverage: number,
): number {
  const factor = 1 / leverage;
  return side === 'Buy'
    ? entryPrice * (1 - factor)
    : entryPrice * (1 + factor);
}

/**
 * Initial margin for an isolated position.
 * margin = size × entryPrice / leverage
 */
export function calcMargin(size: number, entryPrice: number, leverage: number): number {
  return (size * entryPrice) / leverage;
}

/**
 * Return on equity as a fraction (e.g. 0.15 = 15 %).
 * Returns 0 when margin is 0 to avoid division by zero.
 */
export function calcRoe(unrealizedPnl: number, margin: number): number {
  return margin > 0 ? unrealizedPnl / margin : 0;
}
