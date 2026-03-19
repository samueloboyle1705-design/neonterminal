'use client';

/**
 * Execution engine — called on every live price tick.
 *
 * Responsibilities:
 *  1. checkSlTpTriggers: auto-close open positions when SL or TP is breached.
 *  2. checkPendingOrders: trigger pending limit/stop orders when price reaches
 *     the trigger level.
 *
 * Both functions read state fresh from the store on every call — no stale
 * closure issues.  Zustand mutations are synchronous, so there is no risk of
 * double-triggering within a single tick.
 */

import { useTerminalStore } from '@/stores/terminal-store';
import { notify } from '@/stores/notification-store';
import { closeSimulatedPosition, placeMarketOrder } from './simulator';

// ── SL / TP auto-execution ────────────────────────────────────────────────────

/**
 * Check whether any open position's SL or TP has been breached by markPrice.
 * Triggered by StoreStreamBridge after each price update.
 *
 * Long  SL: markPrice <= pos.slPrice
 * Long  TP: markPrice >= pos.tpPrice
 * Short SL: markPrice >= pos.slPrice
 * Short TP: markPrice <= pos.tpPrice
 */
export function checkSlTpTriggers(symbol: string, markPrice: number): void {
  const { positions } = useTerminalStore.getState();
  const relevant = positions.filter((p) => p.symbol === symbol);

  for (const pos of relevant) {
    const isLong = pos.side === 'Buy';
    const sideLabel = isLong ? 'Long' : 'Short';

    // SL check
    if (pos.slPrice && pos.slPrice > 0) {
      const slHit = isLong
        ? markPrice <= pos.slPrice
        : markPrice >= pos.slPrice;

      if (slHit) {
        const result = closeSimulatedPosition(pos.id, markPrice, 'stop-loss');
        if (result.ok) {
          notify(
            `SL hit · ${pos.symbol} ${sideLabel} @ ${markPrice.toFixed(2)}  (${result.realizedPnl >= 0 ? '+' : ''}$${result.realizedPnl.toFixed(2)})`,
            'warn',
          );
        }
        // Continue to next position — current one is now gone from store
        continue;
      }
    }

    // TP check
    if (pos.tpPrice && pos.tpPrice > 0) {
      const tpHit = isLong
        ? markPrice >= pos.tpPrice
        : markPrice <= pos.tpPrice;

      if (tpHit) {
        const result = closeSimulatedPosition(pos.id, markPrice, 'take-profit');
        if (result.ok) {
          notify(
            `TP hit · ${pos.symbol} ${sideLabel} @ ${markPrice.toFixed(2)}  (+$${result.realizedPnl.toFixed(2)})`,
            'success',
          );
        }
      }
    }
  }
}

// ── Pending order auto-trigger ────────────────────────────────────────────────

/**
 * Check whether any pending orders should be triggered at the current markPrice.
 *
 * Limit Buy:  markPrice <= triggerPrice  (fill at or below limit)
 * Limit Sell: markPrice >= triggerPrice  (fill at or above limit)
 * Stop  Buy:  markPrice >= triggerPrice  (breakout entry)
 * Stop  Sell: markPrice <= triggerPrice  (breakdown entry)
 *
 * The order is removed BEFORE placeMarketOrder so it cannot double-trigger.
 */
export function checkPendingOrders(symbol: string, markPrice: number): void {
  const { pendingOrders } = useTerminalStore.getState();
  const relevant = pendingOrders.filter((o) => o.symbol === symbol);

  for (const order of relevant) {
    const { orderType, side, triggerPrice } = order;

    let triggered = false;
    if (orderType === 'Limit') {
      triggered = side === 'Buy'
        ? markPrice <= triggerPrice
        : markPrice >= triggerPrice;
    } else {
      // Stop
      triggered = side === 'Buy'
        ? markPrice >= triggerPrice
        : markPrice <= triggerPrice;
    }

    if (!triggered) continue;

    // Remove first — prevents re-triggering if placeMarketOrder somehow takes time
    useTerminalStore.getState().removePendingOrder(order.id);

    const result = placeMarketOrder({
      symbol: order.symbol,
      side: order.side,
      size: order.size,
      leverage: order.leverage,
      markPrice,
      slPrice: order.slPrice,
      tpPrice: order.tpPrice,
    });

    const sideLabel = order.side === 'Buy' ? 'Long' : 'Short';
    const typeLabel = `${orderType} ${sideLabel}`;

    if (result.ok) {
      notify(
        `${typeLabel} triggered · ${order.symbol} @ ${markPrice.toFixed(2)}`,
        'info',
      );
    } else {
      notify(
        `${typeLabel} rejected · ${result.error}`,
        'error',
      );
    }
  }
}
