/**
 * Shared constants and parameter types for the simulated trading engine.
 * Pure — no imports from stores or UI.
 */

import type { TradeSide } from '@/types/trading';

// ── Constants ────────────────────────────────────────────────────────────────

export const INITIAL_BALANCE = 10_000; // USDT
export const DEFAULT_LEVERAGE = 10;

// ── Order placement ──────────────────────────────────────────────────────────

export interface OpenOrderParams {
  symbol: string;
  side: TradeSide;
  /** Base-asset quantity (e.g. BTC, ETH, SOL). */
  size: number;
  leverage: number;
  /** Execution price — mark price at time of submission. */
  markPrice: number;
  /** Optional stop-loss price (validated before reaching simulator). */
  slPrice?: number;
  /** Optional take-profit price (validated before reaching simulator). */
  tpPrice?: number;
}

export type PlaceOrderResult =
  | { ok: true; positionId: string }
  | { ok: false; error: string };

export type ClosePositionResult =
  | { ok: true; realizedPnl: number }
  | { ok: false; error: string };

/** Generic success/error result with no extra payload. */
export type SimpleResult = { ok: true } | { ok: false; error: string };
