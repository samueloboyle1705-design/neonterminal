/**
 * Symbol-level precision helpers.
 * Rounds prices and sizes to the exchange-accepted tick/lot size.
 * Pure — no side effects.
 */

interface SymbolPrecision {
  /** Decimal places for price. */
  priceDp: number;
  /** Decimal places for size (base asset). */
  sizeDp: number;
  /** Minimum order size. */
  minSize: number;
}

// Bybit linear perpetual tick/lot sizes (approximate for simulation purposes)
const PRECISION: Record<string, SymbolPrecision> = {
  BTCUSDT: { priceDp: 2, sizeDp: 3, minSize: 0.001 },
  ETHUSDT: { priceDp: 2, sizeDp: 2, minSize: 0.01 },
  SOLUSDT: { priceDp: 3, sizeDp: 1, minSize: 0.1 },
};

function getPrecision(symbol: string): SymbolPrecision {
  return PRECISION[symbol] ?? { priceDp: 2, sizeDp: 3, minSize: 0.001 };
}

/** Round a price to the symbol's tick size. */
export function roundPrice(price: number, symbol: string): number {
  const { priceDp } = getPrecision(symbol);
  const factor = 10 ** priceDp;
  return Math.round(price * factor) / factor;
}

/** Round a size to the symbol's lot size. */
export function roundSize(size: number, symbol: string): number {
  const { sizeDp } = getPrecision(symbol);
  const factor = 10 ** sizeDp;
  return Math.round(size * factor) / factor;
}

/** Minimum valid order size for a symbol. */
export function minSize(symbol: string): number {
  return getPrecision(symbol).minSize;
}
