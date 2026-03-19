/**
 * Pure risk/reward calculation functions for the simulated trading engine.
 * No side effects — safe to call anywhere, including during render.
 *
 * All monetary values are in USDT; sizes are in base-asset units.
 */

import type { TradeSide } from '@/types/trading';

// ── SL/TP validation ─────────────────────────────────────────────────────────

/**
 * Validate that SL and TP are on the correct side of the entry price.
 * Returns null for each field if valid (or not provided).
 */
export function validateSlTp(
  side: TradeSide,
  entryPrice: number,
  slPrice: number | null,
  tpPrice: number | null,
): { slError: string | null; tpError: string | null } {
  const isLong = side === 'Buy';
  let slError: string | null = null;
  let tpError: string | null = null;

  if (slPrice !== null && slPrice > 0 && entryPrice > 0) {
    if (isLong && slPrice >= entryPrice)
      slError = 'SL must be below entry for Long';
    if (!isLong && slPrice <= entryPrice)
      slError = 'SL must be above entry for Short';
  }

  if (tpPrice !== null && tpPrice > 0 && entryPrice > 0) {
    if (isLong && tpPrice <= entryPrice)
      tpError = 'TP must be above entry for Long';
    if (!isLong && tpPrice >= entryPrice)
      tpError = 'TP must be below entry for Short';
  }

  return { slError, tpError };
}

// ── Risk-based sizing ────────────────────────────────────────────────────────

/**
 * Calculate position size (base-asset units) such that the loss at the
 * stop-loss price equals the given risk amount in USDT.
 *
 * Derivation:
 *   loss = size × |entryPrice − slPrice|
 *   size = riskAmount / |entryPrice − slPrice|
 *
 * Returns 0 if inputs are invalid or slPrice equals entryPrice.
 */
export function calcSizeFromRisk(
  riskAmount: number,
  entryPrice: number,
  slPrice: number,
): number {
  if (riskAmount <= 0 || entryPrice <= 0 || slPrice <= 0) return 0;
  const dist = Math.abs(entryPrice - slPrice);
  if (dist <= 0) return 0;
  return riskAmount / dist;
}

// ── Risk / reward metrics ────────────────────────────────────────────────────

export interface RiskMetrics {
  /** Absolute price distance from entry to SL. */
  slDistance: number;
  /** SL distance as a fraction of entry price (e.g. 0.0065 = 0.65%). */
  slPct: number;
  /** Estimated P&L at SL (negative = loss). */
  slPnl: number;

  /** Absolute price distance from entry to TP. */
  tpDistance: number;
  /** TP distance as a fraction of entry price (e.g. 0.013 = 1.3%). */
  tpPct: number;
  /** Estimated P&L at TP (positive = gain). */
  tpPnl: number;

  /**
   * Risk : Reward ratio expressed as "1 : X".
   * tpDistance / slDistance. 0 when SL or TP is not set.
   */
  rrRatio: number;
}

/**
 * Compute all risk and reward metrics for a position-in-progress.
 * Returns zeroed metrics when size or prices are not yet valid.
 */
export function calcRiskMetrics(
  side: TradeSide,
  size: number,
  entryPrice: number,
  slPrice: number | null,
  tpPrice: number | null,
): RiskMetrics {
  const isLong = side === 'Buy';
  const zero: RiskMetrics = {
    slDistance: 0, slPct: 0, slPnl: 0,
    tpDistance: 0, tpPct: 0, tpPnl: 0,
    rrRatio: 0,
  };

  if (size <= 0 || entryPrice <= 0) return zero;

  let slDistance = 0, slPct = 0, slPnl = 0;
  if (slPrice !== null && slPrice > 0) {
    slDistance = Math.abs(entryPrice - slPrice);
    slPct = slDistance / entryPrice;
    slPnl = isLong
      ? size * (slPrice - entryPrice)   // negative for long (SL below entry)
      : size * (entryPrice - slPrice);  // negative for short (SL above entry)
  }

  let tpDistance = 0, tpPct = 0, tpPnl = 0;
  if (tpPrice !== null && tpPrice > 0) {
    tpDistance = Math.abs(tpPrice - entryPrice);
    tpPct = tpDistance / entryPrice;
    tpPnl = isLong
      ? size * (tpPrice - entryPrice)   // positive for long (TP above entry)
      : size * (entryPrice - tpPrice);  // positive for short (TP below entry)
  }

  const rrRatio = slDistance > 0 && tpDistance > 0
    ? tpDistance / slDistance
    : 0;

  return { slDistance, slPct, slPnl, tpDistance, tpPct, tpPnl, rrRatio };
}
