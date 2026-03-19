'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Candle,
  ConnectionStatus,
  DisplayTimeframe,
  MarketTick,
  SupportedSymbol,
} from '@/lib/marketData';
import { SUPPORTED_SYMBOLS } from '@/lib/marketData';
import type { ClosedTrade, Order, Position } from '@/types/trading';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface TerminalState {
  // --- Symbol / timeframe selection ---
  selectedSymbol: SupportedSymbol;
  selectedTimeframe: DisplayTimeframe;

  /**
   * Symbols shown in the watchlist panel.
   * Defaults to all supported symbols; can be reordered or trimmed.
   */
  watchlist: SupportedSymbol[];

  // --- Live market data ---
  /**
   * Latest MarketTick per symbol, keyed by symbol name.
   * Written by the ticker stream bridge; read by watchlist rows and headers.
   * Not duplicated into candles — those are a separate concern.
   */
  livePrices: Record<string, MarketTick>;

  /**
   * OHLCV candles for the currently selected symbol + timeframe.
   * Replaced in full whenever the chart requests a new fetch.
   */
  candles: Candle[];
  candlesLoading: boolean;

  // --- Connection ---
  connectionStatus: ConnectionStatus;

  // --- Trading ---
  positions: Position[];
  openOrders: Order[];
  tradeHistory: ClosedTrade[];
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface TerminalActions {
  // Selection
  setSelectedSymbol: (symbol: SupportedSymbol) => void;
  setSelectedTimeframe: (timeframe: DisplayTimeframe) => void;
  addToWatchlist: (symbol: SupportedSymbol) => void;
  removeFromWatchlist: (symbol: SupportedSymbol) => void;

  // Market data
  setLivePrice: (tick: MarketTick) => void;
  setCandles: (candles: Candle[]) => void;
  setCandlesLoading: (loading: boolean) => void;

  // Connection
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Positions
  upsertPosition: (position: Position) => void;
  closePosition: (positionId: string) => void;

  // Trade history
  addTrade: (trade: ClosedTrade) => void;

  // Orders
  upsertOrder: (order: Order) => void;
  cancelOrder: (orderId: string) => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL: TerminalState = {
  selectedSymbol: 'BTCUSDT',
  selectedTimeframe: '1h',
  watchlist: [...SUPPORTED_SYMBOLS],
  livePrices: {},
  candles: [],
  candlesLoading: false,
  connectionStatus: 'disconnected',
  positions: [],
  openOrders: [],
  tradeHistory: [],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useTerminalStore = create<TerminalState & TerminalActions>()(
  devtools(
    (set) => ({
      ...INITIAL,

      // --- Selection ---

      setSelectedSymbol: (symbol) =>
        set({ selectedSymbol: symbol, candles: [], candlesLoading: true }, false, 'setSelectedSymbol'),

      setSelectedTimeframe: (timeframe) =>
        set({ selectedTimeframe: timeframe, candles: [], candlesLoading: true }, false, 'setSelectedTimeframe'),

      addToWatchlist: (symbol) =>
        set(
          (s) =>
            s.watchlist.includes(symbol)
              ? s
              : { watchlist: [...s.watchlist, symbol] },
          false,
          'addToWatchlist',
        ),

      removeFromWatchlist: (symbol) =>
        set(
          (s) => ({ watchlist: s.watchlist.filter((sym) => sym !== symbol) }),
          false,
          'removeFromWatchlist',
        ),

      // --- Market data ---

      setLivePrice: (tick) =>
        set(
          (s) => ({ livePrices: { ...s.livePrices, [tick.symbol]: tick } }),
          false,
          'setLivePrice',
        ),

      setCandles: (candles) =>
        set({ candles, candlesLoading: false }, false, 'setCandles'),

      setCandlesLoading: (loading) =>
        set({ candlesLoading: loading }, false, 'setCandlesLoading'),

      // --- Connection ---

      setConnectionStatus: (status) =>
        set({ connectionStatus: status }, false, 'setConnectionStatus'),

      // --- Positions ---

      upsertPosition: (position) =>
        set(
          (s) => {
            const idx = s.positions.findIndex((p) => p.id === position.id);
            if (idx === -1) {
              return { positions: [...s.positions, position] };
            }
            const next = [...s.positions];
            next[idx] = position;
            return { positions: next };
          },
          false,
          'upsertPosition',
        ),

      closePosition: (positionId) =>
        set(
          (s) => ({ positions: s.positions.filter((p) => p.id !== positionId) }),
          false,
          'closePosition',
        ),

      // --- Trade history ---

      addTrade: (trade) =>
        set(
          (s) => ({ tradeHistory: [trade, ...s.tradeHistory] }),
          false,
          'addTrade',
        ),

      // --- Orders ---

      upsertOrder: (order) =>
        set(
          (s) => {
            const idx = s.openOrders.findIndex((o) => o.id === order.id);
            if (idx === -1) {
              return { openOrders: [...s.openOrders, order] };
            }
            const next = [...s.openOrders];
            next[idx] = order;
            return { openOrders: next };
          },
          false,
          'upsertOrder',
        ),

      cancelOrder: (orderId) =>
        set(
          (s) => ({ openOrders: s.openOrders.filter((o) => o.id !== orderId) }),
          false,
          'cancelOrder',
        ),
    }),
    { name: 'TerminalStore', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

// ---------------------------------------------------------------------------
// Selectors — derived values; use these in components to avoid subscriptions
// to the full store when only a slice is needed.
// ---------------------------------------------------------------------------

/** Live price for the currently selected symbol (or null). */
export const selectCurrentPrice = (s: TerminalState & TerminalActions) =>
  s.livePrices[s.selectedSymbol] ?? null;

/** Total count of open positions. */
export const selectPositionCount = (s: TerminalState & TerminalActions) =>
  s.positions.length;

/** Total unrealized PnL across all open positions. */
export const selectTotalUnrealizedPnl = (s: TerminalState & TerminalActions) =>
  s.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
