'use client';

/**
 * TerminalShell
 *
 * Root client component for the trading terminal.  Sets up the grid layout
 * and renders all sub-panels.  This is the single 'use client' boundary for
 * the entire terminal; all child components inherit the client context.
 */

import { StoreStreamBridge } from './StoreStreamBridge';
import { Topbar } from './Topbar';
import { Watchlist } from './Watchlist';
import { TimeframeTabs } from './TimeframeTabs';
import { ChartPanel } from './ChartPanel';
import { OrderPanel } from './OrderPanel';
import { PositionsPanel } from './PositionsPanel';
import { NotificationStack } from './NotificationStack';

export function TerminalShell() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-t-bg text-t-text">
      {/* Stream → store bridge (invisible) */}
      <StoreStreamBridge />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <Topbar />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: watchlist */}
        <Watchlist />

        {/* Center: timeframe tabs + chart */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <TimeframeTabs />
          <ChartPanel />
        </div>

        {/* Right: order panel */}
        <OrderPanel />
      </div>

      {/* ── Bottom: positions ───────────────────────────────────────────── */}
      <PositionsPanel />

      {/* ── Notification stack (fixed overlay, top-right) ────────────────── */}
      <NotificationStack />
    </div>
  );
}
