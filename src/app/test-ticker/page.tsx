'use client';

/**
 * /test-ticker — live WebSocket ticker health check.
 *
 * Uses useTickerStream to subscribe to all three supported symbols over a
 * single Bybit WebSocket.  Price rows update in real-time without a page
 * refresh.
 *
 * Visit http://localhost:3000/test-ticker while the dev server is running.
 */

import { useTickerStream } from '@/lib/marketData/hooks';
import { SUPPORTED_SYMBOLS } from '@/lib/marketData';
import type { MarketTick } from '@/lib/marketData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtPrice(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(2)}%`;
}

function fmtTime(epochMs: number): string {
  return new Date(epochMs).toISOString().replace('T', ' ').slice(0, 23) + ' UTC';
}

const STATUS_COLOR: Record<string, string> = {
  connecting: '#f5a623',
  connected: '#00ff88',
  disconnected: '#888',
  error: '#ff4444',
};

// ---------------------------------------------------------------------------
// Subcomponent — one row per symbol
// ---------------------------------------------------------------------------

function TickerRow({ symbol, tick }: { symbol: string; tick: MarketTick | undefined }) {
  if (!tick) {
    return (
      <tr>
        <td style={td}>{symbol}</td>
        <td style={{ ...td, color: '#555' }} colSpan={6}>
          waiting for snapshot…
        </td>
      </tr>
    );
  }

  const changeColor = tick.priceChangePct24h >= 0 ? '#00cc66' : '#ff4444';
  // bid/ask are 0 when unavailable (Bybit delta hasn't sent them yet)
  const bidStr = tick.bid > 0 ? fmtPrice(tick.bid) : '—';
  const askStr = tick.ask > 0 ? fmtPrice(tick.ask) : '—';

  return (
    <tr>
      <td style={{ ...td, color: '#7fd3f8', fontWeight: 700 }}>{symbol}</td>
      <td style={{ ...td, textAlign: 'right', color: '#fff', fontWeight: 600 }}>
        {fmtPrice(tick.lastPrice)}
      </td>
      <td style={{ ...td, textAlign: 'right', color: '#00cc66' }}>{bidStr}</td>
      <td style={{ ...td, textAlign: 'right', color: '#ff4444' }}>{askStr}</td>
      <td style={{ ...td, textAlign: 'right', color: changeColor }}>
        {fmtPct(tick.priceChangePct24h)}
      </td>
      <td style={{ ...td, textAlign: 'right', color: '#888' }}>
        {tick.markPrice > 0 ? fmtPrice(tick.markPrice) : '—'}
      </td>
      <td style={{ ...td, textAlign: 'right', color: '#555', fontSize: '0.75rem' }}>
        {fmtTime(tick.timestamp)}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TestTickerPage() {
  const { ticks, status } = useTickerStream(SUPPORTED_SYMBOLS);

  const receivedCount = Object.keys(ticks).length;

  return (
    <main style={page}>
      <h1 style={{ color: '#00ff88', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
        Neon — Live Ticker Stream Test
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#666' }}>WebSocket</span>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: STATUS_COLOR[status] ?? '#888',
          }}
        >
          ● {status}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#555' }}>
          {receivedCount}/{SUPPORTED_SYMBOLS.length} snapshots received
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ color: '#555', textAlign: 'left', borderBottom: '1px solid #222' }}>
            <th style={th}>Symbol</th>
            <th style={{ ...th, textAlign: 'right' }}>Price</th>
            <th style={{ ...th, textAlign: 'right' }}>Bid</th>
            <th style={{ ...th, textAlign: 'right' }}>Ask</th>
            <th style={{ ...th, textAlign: 'right' }}>24h %</th>
            <th style={{ ...th, textAlign: 'right' }}>Mark</th>
            <th style={{ ...th, textAlign: 'right' }}>Last update</th>
          </tr>
        </thead>
        <tbody>
          {SUPPORTED_SYMBOLS.map((sym) => (
            <TickerRow key={sym} symbol={sym} tick={ticks[sym]} />
          ))}
        </tbody>
      </table>

      <footer style={{ color: '#333', fontSize: '0.75rem', marginTop: '3rem' }}>
        Bybit v5 WebSocket · wss://stream.bybit.com/v5/public/linear · topics:{' '}
        {SUPPORTED_SYMBOLS.map((s) => `tickers.${s}`).join(', ')} · auto-reconnects on drop
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Styles (plain objects keep this file self-contained with no CSS deps)
// ---------------------------------------------------------------------------

const page: React.CSSProperties = {
  fontFamily: 'monospace',
  background: '#0d0d0d',
  color: '#e0e0e0',
  minHeight: '100vh',
  padding: '2rem',
};

const th: React.CSSProperties = {
  padding: '6px 12px',
  fontWeight: 400,
  fontSize: '0.8rem',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #1a1a1a',
};
