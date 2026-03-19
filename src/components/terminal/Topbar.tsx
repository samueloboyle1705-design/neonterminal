'use client';

import { useMemo } from 'react';
import { useTerminalStore, selectCurrentPrice } from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';
import type { ConnectionStatus } from '@/lib/marketData';

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const sign = n >= 0 ? '+' : '';
  return `${sign}${fmtUsdt(n)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConnectionPill({ status }: { status: ConnectionStatus }) {
  const isConnected = status === 'connected';
  const isError = status === 'error';

  const dotClass = isConnected
    ? 'bg-t-green'
    : isError
      ? 'bg-t-red'
      : 'bg-t-amber animate-pulse';

  const pillClass = isConnected
    ? 'bg-t-green-dim border-t-green/30 text-t-green'
    : isError
      ? 'bg-t-red-dim border-t-red/30 text-t-red'
      : 'bg-t-surface border-t-border text-t-amber';

  const label = isConnected ? 'Live' : isError ? 'Error' : 'Connecting';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono uppercase tracking-wider ${pillClass}`}>
      <span className={`block w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      {label}
    </div>
  );
}

function VDivider() {
  return <div className="h-5 w-px bg-t-border mx-1" />;
}

function AccountMetric({
  label,
  value,
  valueClass = 'text-t-text',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-0">
      <span className="text-[10px] font-mono text-t-muted uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <span className={`text-xs font-mono tabular-nums whitespace-nowrap ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

export function Topbar() {
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const currentTick = useTerminalStore(selectCurrentPrice);

  const balance       = useAccountStore((s) => s.balance);
  const equity        = useAccountStore((s) => s.equity);
  const unrealizedPnl = useAccountStore((s) => s.unrealizedPnl);
  const realizedPnl   = useAccountStore((s) => s.realizedPnl);

  // Open exposure: Σ(size × markPrice) — re-reads on every position tick
  const positions    = useTerminalStore((s) => s.positions);
  const tradeHistory = useTerminalStore((s) => s.tradeHistory);

  const exposure = useMemo(
    () => positions.reduce((sum, p) => sum + p.size * p.markPrice, 0),
    [positions],
  );

  const tradeStats = useMemo(() => {
    if (tradeHistory.length === 0) return null;
    const wins = tradeHistory.filter((t) => t.realizedPnl > 0).length;
    return { wins, total: tradeHistory.length };
  }, [tradeHistory]);

  const price = currentTick?.lastPrice ?? 0;
  const markPrice = currentTick?.markPrice ?? 0;
  const pricePct = currentTick?.priceChangePct24h ?? 0;
  const bid = currentTick?.bid ?? 0;
  const ask = currentTick?.ask ?? 0;
  const priceUp = pricePct >= 0;

  const baseCurrency = selectedSymbol.replace('USDT', '');

  return (
    <header className="h-12 flex items-center px-0 border-b border-t-border bg-t-panel shrink-0 select-none overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-0 px-4 border-r border-t-border h-full shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-mono font-bold text-t-cyan tracking-[0.2em] uppercase">
            NEON
          </span>
          <span className="text-[10px] font-mono text-t-muted tracking-widest uppercase">
            TERMINAL
          </span>
        </div>
      </div>

      {/* Symbol + price block */}
      <div className="flex items-center gap-5 px-5 border-r border-t-border h-full shrink-0">
        {/* Symbol name */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono font-semibold text-t-text tracking-wide">
            {baseCurrency}
            <span className="text-t-muted font-normal">/USDT</span>
          </span>
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-wider">
            Perp · 100×
          </span>
        </div>

        {/* Live price */}
        {price > 0 ? (
          <>
            <span className={`text-xl font-mono font-semibold tabular-nums leading-none ${priceUp ? 'text-t-green' : 'text-t-red'}`}>
              {fmtPrice(price)}
            </span>

            {/* 24h change pill */}
            <span className={[
              'px-2 py-0.5 rounded text-xs font-mono tabular-nums border',
              priceUp
                ? 'bg-t-green-dim border-t-green/20 text-t-green'
                : 'bg-t-red-dim border-t-red/20 text-t-red',
            ].join(' ')}>
              {priceUp ? '+' : ''}{(pricePct * 100).toFixed(2)}%
            </span>

            {/* Bid / Ask */}
            {bid > 0 && ask > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                  <span className="text-t-muted">B</span>
                  <span className="text-t-green">{fmtPrice(bid)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                  <span className="text-t-muted">A</span>
                  <span className="text-t-red">{fmtPrice(ask)}</span>
                </div>
              </div>
            )}

            {/* Mark price */}
            {markPrice > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-t-muted uppercase tracking-widest">Mark</span>
                <span className="text-xs font-mono text-t-sub tabular-nums">{fmtPrice(markPrice)}</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-xl font-mono text-t-muted">—</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Account metrics + connection */}
      <div className="flex items-center gap-3 px-4 h-full shrink-0">
        {balance > 0 && (
          <>
            <AccountMetric label="Balance" value={fmtUsdt(balance)} />
            <VDivider />
            <AccountMetric label="Equity" value={fmtUsdt(equity)} />
            <VDivider />
            <AccountMetric
              label="uPnL"
              value={fmtPnl(unrealizedPnl)}
              valueClass={unrealizedPnl >= 0 ? 'text-t-green' : 'text-t-red'}
            />
            <VDivider />
            <AccountMetric
              label="rPnL"
              value={fmtPnl(realizedPnl)}
              valueClass={realizedPnl >= 0 ? 'text-t-green' : 'text-t-red'}
            />
            {exposure > 0 && (
              <>
                <VDivider />
                <AccountMetric label="Exposure" value={fmtUsdt(exposure)} valueClass="text-t-sub" />
              </>
            )}
            {tradeStats && (
              <>
                <VDivider />
                <AccountMetric
                  label="Win rate"
                  value={`${tradeStats.wins}/${tradeStats.total}`}
                  valueClass={tradeStats.wins / tradeStats.total >= 0.5 ? 'text-t-green' : 'text-t-red'}
                />
              </>
            )}
            <VDivider />
          </>
        )}
        <ConnectionPill status={connectionStatus} />
      </div>
    </header>
  );
}
