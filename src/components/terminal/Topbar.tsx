'use client';

import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import type { ConnectionStatus } from '@/lib/marketData';

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtUsdt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPnl(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${fmtUsdt(n)}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConnectionDot({ status }: { status: ConnectionStatus }) {
  const colorClass =
    status === 'connected'
      ? 'bg-t-green'
      : status === 'error'
        ? 'bg-t-red'
        : 'bg-t-amber animate-pulse';

  const label =
    status === 'connected' ? 'Live' : status === 'error' ? 'Error' : 'Connecting';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`block w-1.5 h-1.5 rounded-full ${colorClass}`} />
      <span className="text-xs text-t-sub font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-t-border" />;
}

// ── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const currentTick = useTerminalStore(selectCurrentPrice);

  const balance = useAccountStore((s) => s.balance);
  const equity = useAccountStore((s) => s.equity);
  const unrealizedPnl = useAccountStore((s) => s.unrealizedPnl);

  const price = currentTick?.lastPrice ?? 0;
  const pricePct = currentTick?.priceChangePct24h ?? 0;
  const bid = currentTick?.bid ?? 0;
  const ask = currentTick?.ask ?? 0;
  const priceUp = pricePct >= 0;

  return (
    <header className="h-12 flex items-center px-4 gap-0 border-b border-t-border bg-t-panel shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 pr-4 border-r border-t-border h-full">
        <span className="text-sm font-mono font-bold text-t-accent tracking-widest uppercase">
          NEON
        </span>
      </div>

      {/* Symbol + price */}
      <div className="flex items-center gap-4 px-4 border-r border-t-border h-full">
        <span className="text-sm font-mono font-semibold text-t-text tracking-wide">
          {selectedSymbol}
        </span>

        {price > 0 ? (
          <>
            <span
              className={`text-xl font-mono font-semibold tabular-nums ${
                priceUp ? 'text-t-green' : 'text-t-red'
              }`}
            >
              {fmtPrice(price)}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-xs font-mono tabular-nums ${
                  priceUp ? 'text-t-green' : 'text-t-red'
                }`}
              >
                {priceUp ? '+' : ''}
                {(pricePct * 100).toFixed(2)}%
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-t-sub">
                {bid > 0 && (
                  <span>
                    <span className="text-t-muted">B </span>
                    <span className="text-t-green tabular-nums">{fmtPrice(bid)}</span>
                  </span>
                )}
                {ask > 0 && (
                  <span>
                    <span className="text-t-muted">A </span>
                    <span className="text-t-red tabular-nums">{fmtPrice(ask)}</span>
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <span className="text-xl font-mono text-t-muted">—</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side: account + connection */}
      <div className="flex items-center gap-4 pl-4 h-full">
        {balance > 0 && (
          <>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-t-muted uppercase tracking-wider">Balance</span>
              <span className="text-xs font-mono text-t-text tabular-nums">
                {fmtUsdt(balance)}
              </span>
            </div>
            <Divider />
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-t-muted uppercase tracking-wider">Equity</span>
              <span className="text-xs font-mono text-t-text tabular-nums">
                {fmtUsdt(equity)}
              </span>
            </div>
            <Divider />
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-t-muted uppercase tracking-wider">uPnL</span>
              <span
                className={`text-xs font-mono tabular-nums ${
                  unrealizedPnl >= 0 ? 'text-t-green' : 'text-t-red'
                }`}
              >
                {fmtPnl(unrealizedPnl)}
              </span>
            </div>
            <Divider />
          </>
        )}
        <ConnectionDot status={connectionStatus} />
      </div>
    </header>
  );
}
