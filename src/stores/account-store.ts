'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AccountState {
  /**
   * Available wallet balance in quote currency (USDT).
   * This is the settled balance before open-position PnL is included.
   */
  balance: number;

  /**
   * Total equity = balance + unrealizedPnl.
   * Updated whenever a position mark price changes.
   */
  equity: number;

  /**
   * Sum of unrealized PnL across all open positions.
   * Kept here (redundantly with TerminalStore.positions) so account
   * widgets don't have to aggregate positions themselves.
   */
  unrealizedPnl: number;

  /**
   * Realized PnL for the current session (since app load / last reset).
   * Cumulative; incremented when positions are closed.
   */
  realizedPnl: number;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface AccountActions {
  setBalance: (balance: number) => void;
  setEquity: (equity: number) => void;
  setUnrealizedPnl: (pnl: number) => void;
  /**
   * Add `delta` to realizedPnl (called when a position closes).
   * Pass a negative value for a loss.
   */
  addRealizedPnl: (delta: number) => void;
  /** Replace the full account snapshot in one call (e.g. on WS snapshot). */
  setAccountSnapshot: (snapshot: Partial<AccountState>) => void;
  /** Reset realizedPnl to zero (e.g. start of a new session). */
  resetRealizedPnl: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL: AccountState = {
  balance: 0,
  equity: 0,
  unrealizedPnl: 0,
  realizedPnl: 0,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAccountStore = create<AccountState & AccountActions>()(
  devtools(
    (set) => ({
      ...INITIAL,

      setBalance: (balance) =>
        set({ balance }, false, 'setBalance'),

      setEquity: (equity) =>
        set({ equity }, false, 'setEquity'),

      setUnrealizedPnl: (pnl) =>
        set({ unrealizedPnl: pnl }, false, 'setUnrealizedPnl'),

      addRealizedPnl: (delta) =>
        set(
          (s) => ({ realizedPnl: s.realizedPnl + delta }),
          false,
          'addRealizedPnl',
        ),

      setAccountSnapshot: (snapshot) =>
        set(snapshot, false, 'setAccountSnapshot'),

      resetRealizedPnl: () =>
        set({ realizedPnl: 0 }, false, 'resetRealizedPnl'),
    }),
    { name: 'AccountStore', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Margin usage ratio (0–1). Returns 0 when equity is 0. */
export const selectMarginRatio = (s: AccountState & AccountActions) =>
  s.equity > 0 ? 1 - s.balance / s.equity : 0;
