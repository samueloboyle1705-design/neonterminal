/**
 * /test-candles — server-rendered candle health check.
 *
 * Fetches a small number of historical candles from Bybit for each supported
 * symbol across all display timeframes and renders a summary table.
 * No client-side JavaScript required.
 *
 * Visit http://localhost:3000/test-candles while the dev server is running.
 */

import { fetchCandles, SUPPORTED_SYMBOLS, TIMEFRAME_MAP } from '@/lib/marketData';
import type { Candle, DisplayTimeframe } from '@/lib/marketData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function fmtTime(unixSec: number): string {
  return new Date(unixSec * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function fmtVol(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

type FetchResult =
  | { ok: true; candles: Candle[] }
  | { ok: false; error: string };

async function tryFetchCandles(
  symbol: string,
  tf: DisplayTimeframe,
  limit: number,
): Promise<FetchResult> {
  try {
    const candles = await fetchCandles(symbol, tf, limit);
    return { ok: true, candles };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const TIMEFRAMES = Object.keys(TIMEFRAME_MAP) as DisplayTimeframe[];
const FETCH_LIMIT = 5;

export default async function TestCandlesPage() {
  // Fetch all symbol × timeframe combinations in parallel.
  const jobs = SUPPORTED_SYMBOLS.flatMap((symbol) =>
    TIMEFRAMES.map((tf) => ({ symbol, tf })),
  );

  const results = await Promise.all(
    jobs.map(({ symbol, tf }) => tryFetchCandles(symbol, tf, FETCH_LIMIT)),
  );

  // Build a lookup: `${symbol}-${tf}` → FetchResult
  const resultMap = new Map<string, FetchResult>();
  jobs.forEach(({ symbol, tf }, i) => {
    resultMap.set(`${symbol}-${tf}`, results[i]);
  });

  const totalOk = results.filter((r) => r.ok).length;
  const totalFailed = results.length - totalOk;

  return (
    <main
      style={{
        fontFamily: 'monospace',
        background: '#0d0d0d',
        color: '#e0e0e0',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: '#00ff88', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
        Neon — Candle Health Check
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.85rem' }}>
        Each cell fetches {FETCH_LIMIT} candles from Bybit v5 REST (server-side, no cache).
        &nbsp;
        <strong style={{ color: totalFailed === 0 ? '#00ff88' : '#ff4444' }}>
          {totalOk}/{results.length} passed
        </strong>
      </p>

      {SUPPORTED_SYMBOLS.map((symbol) => (
        <section key={symbol} style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#7fd3f8', marginBottom: '1rem', fontSize: '1.1rem' }}>
            {symbol}
          </h2>

          {TIMEFRAMES.map((tf) => {
            const result = resultMap.get(`${symbol}-${tf}`)!;
            return (
              <div
                key={tf}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#141414',
                  border: `1px solid ${result.ok ? '#1e3a2a' : '#3a1e1e'}`,
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      color: '#aaa',
                      fontSize: '0.8rem',
                      background: '#1e1e1e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {tf} → interval:{TIMEFRAME_MAP[tf]}
                  </span>
                  {result.ok ? (
                    <span style={{ color: '#00ff88', fontSize: '0.85rem' }}>
                      ✓ {result.candles.length} candle{result.candles.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={{ color: '#ff4444', fontSize: '0.85rem' }}>✗ error</span>
                  )}
                </div>

                {!result.ok && (
                  <pre
                    style={{
                      color: '#ff6666',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {result.error}
                  </pre>
                )}

                {result.ok && result.candles.length > 0 && (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.8rem',
                    }}
                  >
                    <thead>
                      <tr style={{ color: '#555', textAlign: 'left' }}>
                        <th style={{ padding: '4px 8px' }}>time (UTC)</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>open</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>high</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>low</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>close</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.candles.map((c, idx) => (
                        <tr
                          key={c.time}
                          style={{
                            background: idx % 2 === 0 ? 'transparent' : '#1a1a1a',
                            color: idx === result.candles.length - 1 ? '#fff' : '#bbb',
                          }}
                        >
                          <td style={{ padding: '4px 8px' }}>{fmtTime(c.time)}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                            {fmtPrice(c.open)}
                          </td>
                          <td
                            style={{
                              padding: '4px 8px',
                              textAlign: 'right',
                              color: '#00cc66',
                            }}
                          >
                            {fmtPrice(c.high)}
                          </td>
                          <td
                            style={{
                              padding: '4px 8px',
                              textAlign: 'right',
                              color: '#cc4444',
                            }}
                          >
                            {fmtPrice(c.low)}
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                            {fmtPrice(c.close)}
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', color: '#888' }}>
                            {fmtVol(c.volume)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {result.ok && result.candles.length === 0 && (
                  <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
                    No candles returned (empty list from Bybit).
                  </p>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <footer style={{ color: '#333', fontSize: '0.75rem', marginTop: '2rem' }}>
        Rendered at {new Date().toISOString()} · Bybit v5 /market/kline · category=linear
      </footer>
    </main>
  );
}
