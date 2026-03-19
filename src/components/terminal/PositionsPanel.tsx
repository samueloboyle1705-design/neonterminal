'use client';

import { Fragment, useState, useEffect } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import {
  closeSimulatedPosition,
  partialClosePosition,
  updatePositionSlTp,
} from '@/lib/trading/simulator';
import { calcMargin, calcRoe } from '@/lib/trading/pnl';
import { roundSize } from '@/lib/trading/precision';
import { validateSlTp } from '@/lib/trading/risk';
import type { ClosedTrade, Position } from '@/types/trading';

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 100)    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtPnl(n: number): string {
  return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`;
}

function fmtRoe(n: number): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;
}

function fmtSize(n: number): string {
  return n < 0.01 ? n.toFixed(4) : n < 1 ? n.toFixed(3) : n.toFixed(2);
}

function timeAgo(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60)   return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

// ── EditPanel ─────────────────────────────────────────────────────────────────

interface EditPanelProps {
  position: Position;
  onDone: () => void;
}

function EditPanel({ position, onDone }: EditPanelProps) {
  const [slInput,    setSlInput]    = useState(position.slPrice ? String(position.slPrice) : '');
  const [tpInput,    setTpInput]    = useState(position.tpPrice ? String(position.tpPrice) : '');
  const [closeInput, setCloseInput] = useState('');
  const [error,      setError]      = useState<string | null>(null);
  const [saved,      setSaved]      = useState(false);

  const slNum = parseFloat(slInput) || null;
  const tpNum = parseFloat(tpInput) || null;
  const { slError, tpError } = validateSlTp(position.side, position.entryPrice, slNum, tpNum);

  function handleSaveSlTp() {
    if (slError || tpError) return;
    const result = updatePositionSlTp(position.id, slNum, tpNum);
    if (!result.ok) { setError(result.error); return; }
    setError(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1_500);
  }

  function handleClearSlTp() {
    updatePositionSlTp(position.id, null, null);
    setSlInput(''); setTpInput(''); setError(null);
  }

  function setClosePct(pct: number) {
    const size = roundSize((position.size * pct) / 100, position.symbol);
    setCloseInput(size > 0 ? String(size) : '');
    setError(null);
  }

  function handlePartialClose() {
    const size = parseFloat(closeInput);
    if (!size || size <= 0) { setError('Enter close size'); return; }
    if (size > position.size + 0.0001) { setError(`Max ${fmtSize(position.size)}`); return; }
    const result = partialClosePosition(position.id, size, position.markPrice);
    if (!result.ok) { setError(result.error); return; }
    onDone();
  }

  return (
    <td colSpan={9} className="px-3 pb-2.5 pt-0">
      <div className="flex items-start gap-4 bg-t-surface border border-t-border rounded px-3 py-2">

        {/* SL / TP section */}
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-wider pt-1 shrink-0 w-10">SL/TP</span>
          <div className="flex flex-col gap-0.5">
            <input
              type="number" value={slInput}
              onChange={(e) => { setSlInput(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSlTp()}
              placeholder="SL price"
              className={[
                'w-28 px-2 py-0.5 bg-t-bg border rounded text-xs font-mono tabular-nums',
                'text-t-red placeholder:text-t-muted/40 focus:outline-none',
                slError ? 'border-t-red/50' : 'border-t-border focus:border-t-red/40',
              ].join(' ')}
            />
            {slError && <span className="text-[9px] font-mono text-t-red/80 leading-none">{slError}</span>}
          </div>
          <div className="flex flex-col gap-0.5">
            <input
              type="number" value={tpInput}
              onChange={(e) => { setTpInput(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSlTp()}
              placeholder="TP price"
              className={[
                'w-28 px-2 py-0.5 bg-t-bg border rounded text-xs font-mono tabular-nums',
                'text-t-green placeholder:text-t-muted/40 focus:outline-none',
                tpError ? 'border-t-green/50' : 'border-t-border focus:border-t-green/40',
              ].join(' ')}
            />
            {tpError && <span className="text-[9px] font-mono text-t-green/80 leading-none">{tpError}</span>}
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <button
              onClick={handleSaveSlTp}
              disabled={!!(slError || tpError)}
              className={[
                'px-2 py-0.5 text-[10px] font-mono border rounded transition-colors',
                saved
                  ? 'text-t-green border-t-green/30 bg-t-green-dim'
                  : 'text-t-sub border-t-border hover:text-t-cyan hover:border-t-cyan/30',
                'disabled:opacity-30 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              {saved ? '✓ Saved' : 'Save'}
            </button>
            {(position.slPrice || position.tpPrice) && (
              <button onClick={handleClearSlTp} className="px-1.5 py-0.5 text-[10px] font-mono text-t-muted hover:text-t-red transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="w-px self-stretch bg-t-border shrink-0" />

        {/* Partial close section */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-t-muted uppercase tracking-wider shrink-0 w-10">Close</span>
          <input
            type="number" value={closeInput}
            onChange={(e) => { setCloseInput(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePartialClose()}
            placeholder={fmtSize(position.size)}
            className="w-24 px-2 py-0.5 bg-t-bg border border-t-border rounded text-xs font-mono text-t-text tabular-nums placeholder:text-t-muted/40 focus:outline-none focus:border-t-border-hi"
          />
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct} onClick={() => setClosePct(pct)}
              className="px-1.5 py-0.5 text-[10px] font-mono border border-t-border rounded text-t-muted hover:text-t-text hover:border-t-border-hi transition-colors"
            >
              {pct}%
            </button>
          ))}
          <button
            onClick={handlePartialClose}
            className="px-2 py-0.5 text-[10px] font-mono border border-t-border rounded text-t-sub hover:text-t-red hover:border-t-red hover:bg-t-red-dim transition-colors"
          >
            Close
          </button>
        </div>

        {error && <span className="text-[10px] font-mono text-t-red self-center shrink-0">{error}</span>}
        <button onClick={onDone} className="ml-auto text-t-muted hover:text-t-text text-xs self-center shrink-0 transition-colors" title="Close editor">✕</button>
      </div>
    </td>
  );
}

// ── PositionRow ───────────────────────────────────────────────────────────────

interface PositionRowProps {
  position:     Position;
  isEditing:    boolean;
  onToggleEdit: () => void;
}

function PositionRow({ position, isEditing, onToggleEdit }: PositionRowProps) {
  const isBuy       = position.side === 'Buy';
  const pnlPositive = position.unrealizedPnl >= 0;
  const margin      = calcMargin(position.size, position.entryPrice, position.leverage);
  const roe         = calcRoe(position.unrealizedPnl, margin);

  return (
    <tr className={[
      'transition-colors duration-75 group border-b border-t-border/40',
      isEditing ? 'bg-t-surface/40 border-b-0' : 'hover:bg-t-surface/30',
    ].join(' ')}>
      <td className="pl-4 pr-3 py-2 font-mono text-xs text-t-text whitespace-nowrap">
        <span className="font-semibold">{position.symbol.replace('USDT', '')}</span>
        <span className="text-t-muted">/USDT</span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <span className={[
          'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider',
          isBuy ? 'bg-t-green-dim text-t-green' : 'bg-t-red-dim text-t-red',
        ].join(' ')}>
          {isBuy ? 'Long' : 'Short'}
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-text tabular-nums whitespace-nowrap">{fmtSize(position.size)}</td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-t-sub tabular-nums">{fmtPrice(position.entryPrice)}</span>
          {(position.slPrice || position.tpPrice) && (
            <span className="font-mono text-[10px] tabular-nums leading-none">
              {position.slPrice ? <span className="text-t-red/70">SL {fmtPrice(position.slPrice)}</span> : null}
              {position.slPrice && position.tpPrice ? <span className="text-t-muted/40"> · </span> : null}
              {position.tpPrice ? <span className="text-t-green/70">TP {fmtPrice(position.tpPrice)}</span> : null}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-text tabular-nums whitespace-nowrap">{fmtPrice(position.markPrice)}</td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className={`font-mono text-xs tabular-nums ${pnlPositive ? 'text-t-green' : 'text-t-red'}`}>{fmtPnl(position.unrealizedPnl)}</span>
          <span className={`font-mono text-[10px] tabular-nums ${pnlPositive ? 'text-t-green/60' : 'text-t-red/60'}`}>{fmtRoe(roe)}</span>
        </div>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">{fmtPrice(position.liquidationPrice)}</td>
      <td className="px-3 py-2 font-mono text-xs text-t-muted tabular-nums whitespace-nowrap">{position.leverage}×</td>
      <td className="pr-4 py-2">
        <div className={[
          'flex items-center gap-1 transition-opacity duration-100',
          isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        ].join(' ')}>
          <button
            onClick={onToggleEdit}
            title="Edit SL / TP / partial close"
            className={[
              'px-2 py-0.5 text-[10px] font-mono rounded border transition-colors',
              isEditing
                ? 'text-t-cyan border-t-cyan/40 bg-t-cyan-dim'
                : 'text-t-muted border-t-border hover:text-t-cyan hover:border-t-cyan/40',
            ].join(' ')}
          >
            Edit
          </button>
          <button
            onClick={() => closeSimulatedPosition(position.id, position.markPrice)}
            title="Full close at mark price"
            className="px-2 py-0.5 text-[10px] font-mono rounded border border-t-border text-t-muted hover:text-t-red hover:border-t-red hover:bg-t-red-dim transition-colors"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── HistoryRow ────────────────────────────────────────────────────────────────

function HistoryRow({ trade }: { trade: ClosedTrade }) {
  const isBuy     = trade.side === 'Buy';
  const pnlPos    = trade.realizedPnl >= 0;
  const direction = isBuy ? 'Long' : 'Short';

  return (
    <tr className="border-b border-t-border/30 last:border-0 hover:bg-t-surface/30 transition-colors duration-75">
      <td className="pl-4 pr-3 py-2 font-mono text-[10px] text-t-muted tabular-nums whitespace-nowrap">
        {timeAgo(trade.closedAt)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-text whitespace-nowrap">
        <span className="font-semibold">{trade.symbol.replace('USDT', '')}</span>
        <span className="text-t-muted">/USDT</span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <span className={[
          'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider',
          isBuy ? 'bg-t-green-dim text-t-green' : 'bg-t-red-dim text-t-red',
        ].join(' ')}>
          {direction}
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-t-sub tabular-nums whitespace-nowrap">{fmtSize(trade.size)}</td>
      <td className="px-3 py-2 font-mono text-xs text-t-sub tabular-nums whitespace-nowrap">
        {fmtPrice(trade.entryPrice)} → {fmtPrice(trade.exitPrice)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className={`font-mono text-xs tabular-nums ${pnlPos ? 'text-t-green' : 'text-t-red'}`}>
          {fmtPnl(trade.realizedPnl)}
        </span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        {(trade.slPrice || trade.tpPrice) ? (
          <span className="font-mono text-[10px] text-t-muted tabular-nums">
            {trade.slPrice ? <span className="text-t-red/60">SL {fmtPrice(trade.slPrice)}</span> : null}
            {trade.slPrice && trade.tpPrice ? <span className="text-t-muted/40"> · </span> : null}
            {trade.tpPrice ? <span className="text-t-green/60">TP {fmtPrice(trade.tpPrice)}</span> : null}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-t-muted/30">—</span>
        )}
      </td>
      <td className="pr-4 py-2">
        {trade.isPartial && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-t-surface text-t-muted border border-t-border/50">
            partial
          </span>
        )}
      </td>
    </tr>
  );
}

// ── PositionsPanel ────────────────────────────────────────────────────────────

type ActiveTab = 'positions' | 'orders' | 'history';

export function PositionsPanel() {
  const positions    = useTerminalStore((s) => s.positions);
  const openOrders   = useTerminalStore((s) => s.openOrders);
  const tradeHistory = useTerminalStore((s) => s.tradeHistory);

  const [activeTab,  setActiveTab]  = useState<ActiveTab>('positions');
  const [editingId,  setEditingId]  = useState<string | null>(null);

  // Switch to Positions tab when a new position opens
  useEffect(() => {
    if (positions.length > 0 && activeTab === 'history') setActiveTab('positions');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length]);

  // Clear editingId when the position being edited is fully closed
  useEffect(() => {
    if (editingId && !positions.find((p) => p.id === editingId)) setEditingId(null);
  }, [positions, editingId]);

  function toggleEdit(id: string) {
    setEditingId((prev) => (prev === id ? null : id));
  }

  const tabs: { id: ActiveTab; label: string; count?: number; accent?: boolean }[] = [
    { id: 'positions', label: 'Positions', count: positions.length,   accent: positions.length > 0 },
    { id: 'orders',    label: 'Orders',    count: openOrders.length },
    { id: 'history',   label: 'History',   count: tradeHistory.length },
  ];

  return (
    <section className="h-44 flex flex-col border-t border-t-border bg-t-panel shrink-0">

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-t-border shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-2 border-r border-t-border border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? tab.accent
                  ? 'border-b-t-cyan'
                  : 'border-b-t-sub'
                : 'border-b-transparent hover:border-b-t-border-hi',
            ].join(' ')}
          >
            <span className={`text-xs font-mono uppercase tracking-wider ${activeTab === tab.id ? 'text-t-sub' : 'text-t-muted'}`}>
              {tab.label}
            </span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={[
                'px-1.5 py-0.5 text-[10px] font-mono rounded',
                tab.accent && activeTab === tab.id
                  ? 'bg-t-cyan-dim text-t-cyan border border-t-cyan/20'
                  : 'bg-t-surface text-t-muted',
              ].join(' ')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Positions tab */}
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs font-mono text-t-muted">No open positions</span>
            </div>
          ) : (
            <table className="w-full text-left min-w-max">
              <thead className="sticky top-0 bg-t-panel z-10 border-b border-t-border">
                <tr>
                  {['Symbol', 'Side', 'Size', 'Entry', 'Mark', 'uPnL / ROE', 'Liq.', 'Lev.', ''].map((h) => (
                    <th key={h} className={[
                      'py-1.5 text-[10px] font-mono text-t-muted font-normal whitespace-nowrap uppercase tracking-wider',
                      h === 'Symbol' ? 'pl-4 pr-3' : 'px-3',
                      h === '' ? 'pr-4' : '',
                    ].join(' ')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <Fragment key={pos.id}>
                    <PositionRow
                      position={pos}
                      isEditing={editingId === pos.id}
                      onToggleEdit={() => toggleEdit(pos.id)}
                    />
                    {editingId === pos.id && (
                      <tr className="bg-t-panel border-b border-t-border/40">
                        <EditPanel key={pos.id} position={pos} onDone={() => setEditingId(null)} />
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-mono text-t-muted">No open orders</span>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          tradeHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs font-mono text-t-muted">No trade history yet</span>
            </div>
          ) : (
            <table className="w-full text-left min-w-max">
              <thead className="sticky top-0 bg-t-panel z-10 border-b border-t-border">
                <tr>
                  {['Time', 'Symbol', 'Side', 'Size', 'Entry → Exit', 'rPnL', 'SL / TP', ''].map((h) => (
                    <th key={h} className={[
                      'py-1.5 text-[10px] font-mono text-t-muted font-normal whitespace-nowrap uppercase tracking-wider',
                      h === 'Time' ? 'pl-4 pr-3' : 'px-3',
                      h === '' ? 'pr-4' : '',
                    ].join(' ')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade) => (
                  <HistoryRow key={trade.id} trade={trade} />
                ))}
              </tbody>
            </table>
          )
        )}

      </div>
    </section>
  );
}
