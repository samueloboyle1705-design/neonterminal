'use client';

/**
 * /test-store — store wiring debug page.
 *
 * Demonstrates:
 *  1. useTickerStream → setLivePrice + setConnectionStatus bridge
 *  2. Live prices flowing through the terminal store
 *  3. setSelectedSymbol / setSelectedTimeframe actions
 *  4. upsertPosition / closePosition actions (mock data)
 *  5. account store actions
 *
 * Visit http://localhost:3000/test-store while the dev server is running.
 * Open Redux DevTools to inspect action history.
 */

import { useEffect } from 'react';
import { useTickerStream } from '@/lib/marketData/hooks';
import { SUPPORTED_SYMBOLS, TIMEFRAME_MAP } from '@/lib/marketData';
import type { DisplayTimeframe, SupportedSymbol } from '@/lib/marketData';
import type { Position } from '@/types/trading';
import {
  useTerminalStore,
  selectCurrentPrice,
  selectTotalUnrealizedPnl,
} from '@/stores/terminal-store';
import { useAccountStore } from '@/stores/account-store';

// ---------------------------------------------------------------------------
// Bridge component — wires live stream data into the terminal store.
// Rendered once; has no visible output.
// ---------------------------------------------------------------------------

function StoreStreamBridge() {
  const { ticks, status } = useTickerStream(SUPPORTED_SYMBOLS);
  const setLivePrice = useTerminalStore((s) => s.setLivePrice);
  const setConnectionStatus = useTerminalStore((s) => s.setConnectionStatus);

  // Push connection status into the store whenever it changes.
  useEffect(() => {
    setConnectionStatus(status);
  }, [status, setConnectionStatus]);

  // Push each incoming tick into the store.
  useEffect(() => {
    for (const tick of Object.values(ticks)) {
      setLivePrice(tick);
    }
  }, [ticks, setLivePrice]);

  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<string, string> = {
  connecting: '#f5a623',
  connected: '#00ff88',
  disconnected: '#888',
  error: '#ff4444',
};

function fmtPrice(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function fmtPnl(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Mock positions for testing upsert / close actions
// ---------------------------------------------------------------------------

const MOCK_POSITIONS: Position[] = [
  {
    id: 'BTCUSDT-Buy',
    symbol: 'BTCUSDT',
    side: 'Buy',
    size: 0.1,
    entryPrice: 65000,
    markPrice: 67200,
    liquidationPrice: 58000,
    unrealizedPnl: 220,
    leverage: 10,
  },
  {
    id: 'ETHUSDT-Sell',
    symbol: 'ETHUSDT',
    side: 'Sell',
    size: 1,
    entryPrice: 3200,
    markPrice: 3180,
    liquidationPrice: 3520,
    unrealizedPnl: 20,
    leverage: 5,
  },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const TIMEFRAMES = Object.keys(TIMEFRAME_MAP) as DisplayTimeframe[];

export default function TestStorePage() {
  // Terminal store slices
  const selectedSymbol = useTerminalStore((s) => s.selectedSymbol);
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const watchlist = useTerminalStore((s) => s.watchlist);
  const livePrices = useTerminalStore((s) => s.livePrices);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const positions = useTerminalStore((s) => s.positions);
  const candlesLoading = useTerminalStore((s) => s.candlesLoading);
  const currentPrice = useTerminalStore(selectCurrentPrice);
  const totalUnrealizedPnl = useTerminalStore(selectTotalUnrealizedPnl);

  // Terminal actions
  const setSelectedSymbol = useTerminalStore((s) => s.setSelectedSymbol);
  const setSelectedTimeframe = useTerminalStore((s) => s.setSelectedTimeframe);
  const upsertPosition = useTerminalStore((s) => s.upsertPosition);
  const closePosition = useTerminalStore((s) => s.closePosition);

  // Account store
  const balance = useAccountStore((s) => s.balance);
  const equity = useAccountStore((s) => s.equity);
  const unrealizedPnl = useAccountStore((s) => s.unrealizedPnl);
  const realizedPnl = useAccountStore((s) => s.realizedPnl);
  const setAccountSnapshot = useAccountStore((s) => s.setAccountSnapshot);
  const addRealizedPnl = useAccountStore((s) => s.addRealizedPnl);
  const resetRealizedPnl = useAccountStore((s) => s.resetRealizedPnl);

  return (
    <>
      {/* Bridge: no UI, just syncs stream into store */}
      <StoreStreamBridge />

      <main style={page}>
        <h1 style={{ color: '#00ff88', fontSize: '1.4rem', marginBottom: '0.25rem' }}>
          Neon — Store Debug
        </h1>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '2rem' }}>
          Open Redux DevTools to inspect action history.
        </p>

        {/* ── Connection status ── */}
        <section style={card}>
          <h2 style={cardTitle}>Connection</h2>
          <span
            style={{
              color: STATUS_COLOR[connectionStatus] ?? '#888',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            ● {connectionStatus}
          </span>
        </section>

        {/* ── Symbol / timeframe selection ── */}
        <section style={card}>
          <h2 style={cardTitle}>Selection</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {SUPPORTED_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym as SupportedSymbol)}
                style={sym === selectedSymbol ? btnActive : btn}
              >
                {sym}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                style={tf === selectedTimeframe ? btnActive : btn}
              >
                {tf}
              </button>
            ))}
          </div>
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Selected: <b style={{ color: '#fff' }}>{selectedSymbol}</b> /{' '}
            <b style={{ color: '#fff' }}>{selectedTimeframe}</b>
            {candlesLoading && (
              <span style={{ color: '#f5a623', marginLeft: '1rem' }}>candles loading…</span>
            )}
          </p>
        </section>

        {/* ── Live prices (from store, fed by stream bridge) ── */}
        <section style={card}>
          <h2 style={cardTitle}>Live Prices (from store)</h2>
          {watchlist.length === 0 && (
            <p style={{ color: '#555', fontSize: '0.8rem' }}>No symbols in watchlist.</p>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: '#555', borderBottom: '1px solid #222' }}>
                <th style={th}>Symbol</th>
                <th style={{ ...th, textAlign: 'right' }}>Last price</th>
                <th style={{ ...th, textAlign: 'right' }}>Bid</th>
                <th style={{ ...th, textAlign: 'right' }}>Ask</th>
                <th style={{ ...th, textAlign: 'right' }}>24h %</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((sym) => {
                const t = livePrices[sym];
                if (!t) {
                  return (
                    <tr key={sym}>
                      <td style={td}>{sym}</td>
                      <td style={{ ...td, color: '#555' }} colSpan={4}>
                        waiting…
                      </td>
                    </tr>
                  );
                }
                const pct = t.priceChangePct24h;
                return (
                  <tr key={sym} style={sym === selectedSymbol ? { background: '#0d1f15' } : {}}>
                    <td style={{ ...td, color: sym === selectedSymbol ? '#00ff88' : '#7fd3f8' }}>
                      {sym}
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: '#fff' }}>
                      {fmtPrice(t.lastPrice)}
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: '#00cc66' }}>
                      {t.bid > 0 ? fmtPrice(t.bid) : '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: '#ff4444' }}>
                      {t.ask > 0 ? fmtPrice(t.ask) : '—'}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: 'right',
                        color: pct >= 0 ? '#00cc66' : '#ff4444',
                      }}
                    >
                      {pct >= 0 ? '+' : ''}
                      {(pct * 100).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {currentPrice && (
            <p style={{ color: '#555', fontSize: '0.78rem', marginTop: '0.75rem' }}>
              selectCurrentPrice({selectedSymbol}) →{' '}
              <b style={{ color: '#fff' }}>{fmtPrice(currentPrice.lastPrice)}</b>
            </p>
          )}
        </section>

        {/* ── Positions ── */}
        <section style={card}>
          <h2 style={cardTitle}>Positions</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {MOCK_POSITIONS.map((p) => (
              <button key={p.id} onClick={() => upsertPosition(p)} style={btn}>
                + upsert {p.id}
              </button>
            ))}
            <button
              onClick={() => {
                const updated = { ...MOCK_POSITIONS[0], unrealizedPnl: Math.random() * 500 - 100 };
                upsertPosition(updated);
              }}
              style={btn}
            >
              ~ update BTCUSDT PnL
            </button>
          </div>

          {positions.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.8rem' }}>
              No open positions. Use buttons above to add mock positions.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: '#555', borderBottom: '1px solid #222' }}>
                  <th style={th}>ID</th>
                  <th style={{ ...th, textAlign: 'right' }}>Side</th>
                  <th style={{ ...th, textAlign: 'right' }}>Size</th>
                  <th style={{ ...th, textAlign: 'right' }}>Entry</th>
                  <th style={{ ...th, textAlign: 'right' }}>uPnL</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id}>
                    <td style={td}>{p.id}</td>
                    <td
                      style={{
                        ...td,
                        textAlign: 'right',
                        color: p.side === 'Buy' ? '#00cc66' : '#ff4444',
                      }}
                    >
                      {p.side}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>{p.size}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{fmtPrice(p.entryPrice)}</td>
                    <td
                      style={{
                        ...td,
                        textAlign: 'right',
                        color: p.unrealizedPnl >= 0 ? '#00cc66' : '#ff4444',
                      }}
                    >
                      {fmtPnl(p.unrealizedPnl)}
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => {
                          closePosition(p.id);
                          addRealizedPnl(p.unrealizedPnl);
                        }}
                        style={{ ...btn, fontSize: '0.72rem', padding: '2px 8px', color: '#ff6666' }}
                      >
                        close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {positions.length > 0 && (
            <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.75rem' }}>
              selectTotalUnrealizedPnl →{' '}
              <b style={{ color: totalUnrealizedPnl >= 0 ? '#00cc66' : '#ff4444' }}>
                {fmtPnl(totalUnrealizedPnl)}
              </b>
            </p>
          )}
        </section>

        {/* ── Account store ── */}
        <section style={card}>
          <h2 style={cardTitle}>Account Store</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() =>
                setAccountSnapshot({ balance: 10000, equity: 10250, unrealizedPnl: 250 })
              }
              style={btn}
            >
              set mock snapshot
            </button>
            <button onClick={() => addRealizedPnl(150)} style={btn}>
              + add $150 realized
            </button>
            <button onClick={() => addRealizedPnl(-75)} style={btn}>
              + add -$75 realized
            </button>
            <button onClick={resetRealizedPnl} style={{ ...btn, color: '#ff9966' }}>
              reset realized PnL
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <tbody>
              {(
                [
                  ['balance', balance, '#fff'],
                  ['equity', equity, '#fff'],
                  ['unrealizedPnl', unrealizedPnl, unrealizedPnl >= 0 ? '#00cc66' : '#ff4444'],
                  ['realizedPnl', realizedPnl, realizedPnl >= 0 ? '#00cc66' : '#ff4444'],
                ] as [string, number, string][]
              ).map(([label, value, color]) => (
                <tr key={label} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ ...td, color: '#555', width: '40%' }}>{label}</td>
                  <td style={{ ...td, textAlign: 'right', color, fontWeight: 600 }}>
                    {fmtPnl(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer style={{ color: '#333', fontSize: '0.75rem', marginTop: '2rem' }}>
          TerminalStore + AccountStore (Zustand v5 + devtools) · bridge via useTickerStream
        </footer>
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const page: React.CSSProperties = {
  fontFamily: 'monospace',
  background: '#0d0d0d',
  color: '#e0e0e0',
  minHeight: '100vh',
  padding: '2rem',
  maxWidth: '900px',
};

const card: React.CSSProperties = {
  background: '#141414',
  border: '1px solid #1e1e1e',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1.5rem',
};

const cardTitle: React.CSSProperties = {
  color: '#555',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '1rem',
  fontWeight: 400,
};

const btn: React.CSSProperties = {
  background: '#1e1e1e',
  border: '1px solid #333',
  color: '#bbb',
  borderRadius: '4px',
  padding: '4px 12px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
};

const btnActive: React.CSSProperties = {
  ...btn,
  background: '#0d3a1e',
  border: '1px solid #00ff88',
  color: '#00ff88',
};

const th: React.CSSProperties = { padding: '4px 10px', fontWeight: 400, fontSize: '0.78rem' };
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #1a1a1a' };
