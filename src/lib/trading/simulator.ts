'use client';

/**
 * Simulated trading engine.
 *
 * All functions operate outside React (via Zustand .getState()) so they can be
 * called from event handlers, effects, or stream bridges without hooks.
 *
 * Accounting model (isolated margin):
 *   balance  = free USDT not locked in any position
 *   equity   = balance + Σ(margin_i) + Σ(uPnL_i)
 *            = balance + Σ(size_i × entryPrice_i / leverage_i) + Σ(uPnL_i)
 *
 * On open:  balance -= margin
 * On close: balance += margin + realizedPnl
 *           realizedPnl added to account-store cumulative total
 *
 * Position IDs follow the pattern `${symbol}-${side}` so there is at most one
 * long and one short per symbol.  Opening a new Buy while a Sell is open (or
 * vice versa) is rejected — close the opposing side first.
 */

import { useTerminalStore } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import type { Position } from '@/types/trading';
import { calcUnrealizedPnl, calcLiquidationPrice, calcMargin } from './pnl';
import { roundSize, roundPrice, minSize } from './precision';
import { validateSlTp } from './risk';
import { INITIAL_BALANCE } from './types';
import type { OpenOrderParams, PlaceOrderResult, ClosePositionResult, SimpleResult } from './types';

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Recompute equity from the current balance and all open positions.
 * Called after every state mutation that affects positions or balance.
 */
function syncEquity(): void {
  const { balance, positions } = _getState();
  const marginAndPnl = positions.reduce(
    (sum, p) => sum + calcMargin(p.size, p.entryPrice, p.leverage) + p.unrealizedPnl,
    0,
  );
  useAccountStore.getState().setEquity(balance + marginAndPnl);
}

/** Convenience: read both stores' state in one call. */
function _getState() {
  return {
    ...useAccountStore.getState(),
    ...useTerminalStore.getState(),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Seed the simulated account with an initial balance.
 * Idempotent — does nothing if balance is already > 0.
 */
export function initSimulatedAccount(): void {
  const { balance } = useAccountStore.getState();
  if (balance > 0) return;
  useAccountStore.getState().setAccountSnapshot({
    balance: INITIAL_BALANCE,
    equity: INITIAL_BALANCE,
    unrealizedPnl: 0,
    realizedPnl: 0,
  });
}

/**
 * Open a simulated market position at the given mark price.
 *
 * Validates:
 *  - markPrice must be > 0
 *  - size must be ≥ minSize for the symbol
 *  - no conflicting open position (opposite side)
 *  - sufficient free balance to cover the required margin
 */
export function placeMarketOrder(params: OpenOrderParams): PlaceOrderResult {
  const { symbol, side, leverage, markPrice } = params;
  const size = roundSize(params.size, symbol);
  const price = roundPrice(markPrice, symbol);

  if (price <= 0) return { ok: false, error: 'No live price — wait for feed' };
  if (size < minSize(symbol)) {
    return { ok: false, error: `Min size is ${minSize(symbol)} ${symbol.replace('USDT', '')}` };
  }

  const { balance, positions } = _getState();

  // Reject if the opposing side is already open
  const opposingSide = side === 'Buy' ? 'Sell' : 'Buy';
  const conflict = positions.find(
    (p) => p.symbol === symbol && p.side === opposingSide,
  );
  if (conflict) {
    return {
      ok: false,
      error: `Close the ${opposingSide === 'Sell' ? 'Short' : 'Long'} position first`,
    };
  }

  // Reject if a position for the same side already exists (add to position later)
  const existing = positions.find((p) => p.symbol === symbol && p.side === side);
  if (existing) {
    return {
      ok: false,
      error: `A ${side === 'Buy' ? 'Long' : 'Short'} position is already open`,
    };
  }

  const margin = calcMargin(size, price, leverage);
  if (margin > balance) {
    return {
      ok: false,
      error: `Insufficient balance (need $${margin.toFixed(2)}, have $${balance.toFixed(2)})`,
    };
  }

  const positionId = `${symbol}-${side}`;
  const unrealizedPnl = 0; // entry price === mark price at open

  const position: Position = {
    id: positionId,
    symbol,
    side,
    size,
    entryPrice: price,
    markPrice: price,
    liquidationPrice: calcLiquidationPrice(side, price, leverage),
    unrealizedPnl,
    leverage,
    ...(params.slPrice && params.slPrice > 0
      ? { slPrice: roundPrice(params.slPrice, symbol) }
      : {}),
    ...(params.tpPrice && params.tpPrice > 0
      ? { tpPrice: roundPrice(params.tpPrice, symbol) }
      : {}),
  };

  // Deduct margin from free balance
  const newBalance = balance - margin;
  useAccountStore.getState().setBalance(newBalance);
  useTerminalStore.getState().upsertPosition(position);
  syncEquity();

  return { ok: true, positionId };
}

/**
 * Close an open position at the given mark price.
 * Returns margin + realizedPnl to the free balance and records the PnL.
 */
export function closeSimulatedPosition(
  positionId: string,
  markPrice: number,
): ClosePositionResult {
  const { positions, balance } = _getState();
  const position = positions.find((p) => p.id === positionId);
  if (!position) return { ok: false, error: 'Position not found' };

  const realizedPnl = calcUnrealizedPnl(
    position.side,
    position.size,
    position.entryPrice,
    markPrice,
  );
  const margin = calcMargin(position.size, position.entryPrice, position.leverage);
  const returned = margin + realizedPnl;

  useAccountStore.getState().setBalance(balance + returned);
  useAccountStore.getState().addRealizedPnl(realizedPnl);
  useTerminalStore.getState().closePosition(positionId);
  syncEquity();

  return { ok: true, realizedPnl };
}

/**
 * Update the SL and/or TP on an open position.
 * Pass null to clear a level.  Validates long/short direction before persisting.
 */
export function updatePositionSlTp(
  positionId: string,
  slPrice: number | null,
  tpPrice: number | null,
): SimpleResult {
  const { positions } = useTerminalStore.getState();
  const position = positions.find((p) => p.id === positionId);
  if (!position) return { ok: false, error: 'Position not found' };

  const { slError, tpError } = validateSlTp(
    position.side,
    position.entryPrice,
    slPrice,
    tpPrice,
  );
  if (slError) return { ok: false, error: slError };
  if (tpError) return { ok: false, error: tpError };

  const updated: Position = {
    ...position,
    slPrice: slPrice && slPrice > 0 ? roundPrice(slPrice, position.symbol) : undefined,
    tpPrice: tpPrice && tpPrice > 0 ? roundPrice(tpPrice, position.symbol) : undefined,
  };
  useTerminalStore.getState().upsertPosition(updated);
  return { ok: true };
}

/**
 * Partially close an open position at the given mark price.
 *
 * If closeSize >= position.size the call is forwarded to closeSimulatedPosition
 * (full close).  Otherwise:
 *  - Realizes PnL proportional to the closed fraction.
 *  - Returns (closedMargin + realizedPnl) to free balance.
 *  - Reduces position size; SL/TP are preserved on the remainder.
 */
export function partialClosePosition(
  positionId: string,
  closeSize: number,
  markPrice: number,
): ClosePositionResult {
  const { positions, balance } = _getState();
  const position = positions.find((p) => p.id === positionId);
  if (!position) return { ok: false, error: 'Position not found' };

  const rounded = roundSize(closeSize, position.symbol);
  if (rounded <= 0) return { ok: false, error: 'Invalid close size' };

  // Delegate to full close when the amount covers the whole position
  if (rounded >= position.size) {
    return closeSimulatedPosition(positionId, markPrice);
  }

  const realizedPnl = calcUnrealizedPnl(
    position.side,
    rounded,
    position.entryPrice,
    markPrice,
  );
  const closedMargin = calcMargin(rounded, position.entryPrice, position.leverage);
  const returned = closedMargin + realizedPnl;

  const remainingSize = roundSize(position.size - rounded, position.symbol);
  // Edge case: rounding collapses remainder to 0 — treat as full close
  if (remainingSize <= 0) {
    return closeSimulatedPosition(positionId, markPrice);
  }

  const remainingPnl = calcUnrealizedPnl(
    position.side,
    remainingSize,
    position.entryPrice,
    markPrice,
  );

  const updated: Position = {
    ...position,
    size: remainingSize,
    markPrice,
    unrealizedPnl: remainingPnl,
  };

  useAccountStore.getState().setBalance(balance + returned);
  useAccountStore.getState().addRealizedPnl(realizedPnl);
  useTerminalStore.getState().upsertPosition(updated);
  syncEquity();

  return { ok: true, realizedPnl };
}

/**
 * Update mark price and unrealized PnL for all positions in a given symbol.
 * Called on every live tick from StoreStreamBridge.
 * Updates the account-store unrealizedPnl aggregate and equity too.
 */
export function updatePositionPrices(symbol: string, markPrice: number): void {
  const { positions } = useTerminalStore.getState();
  const relevant = positions.filter((p) => p.symbol === symbol);
  if (relevant.length === 0) return;

  for (const pos of relevant) {
    const unrealizedPnl = calcUnrealizedPnl(pos.side, pos.size, pos.entryPrice, markPrice);
    useTerminalStore.getState().upsertPosition({ ...pos, markPrice, unrealizedPnl });
  }

  // Recalculate aggregate uPnL and equity after updates
  const allPositions = useTerminalStore.getState().positions;
  const totalUPnl = allPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  useAccountStore.getState().setUnrealizedPnl(totalUPnl);
  syncEquity();
}
