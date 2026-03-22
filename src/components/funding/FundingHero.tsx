/**
 * FundingHero
 *
 * Full-viewport hero section for /crypto-funding.
 * Left column: headline + stats + CTAs.
 * Right column (desktop): live trading dashboard card + floating chips.
 * Mobile: single column with simplified card preview.
 *
 * Server component — Button and StatChip handle their own client boundaries.
 */

import { LiveBadge }            from '@/components/neon/LiveBadge';
import { GradientText }         from '@/components/neon/GradientText';
import { StatChip, StatChipRow } from '@/components/neon/StatChip';
import { Button }               from '@/components/neon/Button';
import { COLORS, SHADOWS }      from '@/lib/neon/constants';

// ── Performance chart (SVG) ───────────────────────────────────────────────

function PerformanceChart() {
  return (
    <div
      style={{
        position:     'relative',
        borderRadius: '12px',
        overflow:     'hidden',
        background:   'rgba(0,0,0,0.25)',
      }}
    >
      <svg
        viewBox="0 0 400 100"
        style={{ width: '100%', height: '100px', display: 'block' }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="fh-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00E887" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#00E887" stopOpacity="0"    />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d="M0,85 L45,76 L85,68 L105,74 L135,53 L165,45 L195,36 L225,41 L255,26 L285,19 L315,12 L345,17 L375,7 L400,3 L400,100 L0,100Z"
          fill="url(#fh-chart-fill)"
        />
        {/* Line */}
        <path
          d="M0,85 L45,76 L85,68 L105,74 L135,53 L165,45 L195,36 L225,41 L255,26 L285,19 L315,12 L345,17 L375,7 L400,3"
          fill="none" stroke="#00E887" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Vertical guide */}
        <line x1="400" y1="3" x2="400" y2="100"
          stroke="rgba(0,232,135,0.15)" strokeWidth="1" strokeDasharray="4,4" />
        {/* Current dot */}
        <circle cx="400" cy="3" r="4"  fill="#00E887" />
        <circle cx="400" cy="3" r="9"  fill="rgba(0,232,135,0.18)" />
      </svg>

      {/* Axis labels */}
      <span
        style={{
          position:      'absolute', top: '8px', left: '12px',
          fontFamily:    'var(--font-geist-mono)', fontSize: '10px',
          color:         '#4A5E78', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
      >
        30D Performance
      </span>
      <span
        style={{
          position:   'absolute', top: '8px', right: '12px',
          fontFamily: 'var(--font-geist-mono)', fontSize: '13px',
          color:      '#00E887', fontWeight: 700, letterSpacing: '-0.01em',
        }}
      >
        +18.4%
      </span>
    </div>
  );
}

// ── Dashboard card ────────────────────────────────────────────────────────

function DashboardCard({ compact = false }: { compact?: boolean }) {
  const p = compact ? '20px' : '28px';

  return (
    <div
      style={{
        background:           'rgba(11,15,23,0.92)',
        backdropFilter:       'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border:               '1px solid rgba(0,232,135,0.14)',
        borderRadius:         '20px',
        padding:              p,
        boxShadow:            `${SHADOWS.glowGreenMd}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        position:             'relative',
        overflow:             'hidden',
      }}
    >
      {/* Subtle surface gradient overlay */}
      <div
        aria-hidden
        style={{
          position:      'absolute', inset: 0, borderRadius: '20px', pointerEvents: 'none',
          background:    'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.08) 100%)',
        }}
      />

      {/* Card header: account info + balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#4A5E78', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Funded Account · PRO
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1, color: '#E8EDF8', fontSize: compact ? '24px' : '32px' }}>
            $248,340
            <span style={{ fontSize: compact ? '14px' : '18px', color: '#3D4F66', fontWeight: 400 }}>.50</span>
          </div>
        </div>
        <LiveBadge size="sm" />
      </div>

      {/* Performance chart */}
      <div style={{ marginBottom: '20px' }}>
        <PerformanceChart />
      </div>

      {/* Today's P&L */}
      <div
        style={{
          background:    'linear-gradient(135deg, rgba(0,232,135,0.09) 0%, rgba(0,232,135,0.03) 100%)',
          border:        '1px solid rgba(0,232,135,0.13)',
          borderRadius:  '12px',
          padding:       compact ? '13px 16px' : '16px 20px',
          marginBottom:  '20px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
            Today's P&L
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: compact ? '20px' : '26px', fontWeight: 800, color: '#00E887', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            +$3,247.20
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: compact ? '16px' : '20px', fontWeight: 700, color: '#00E887', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            +1.32%
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ROE Today
          </div>
        </div>
      </div>

      {/* 3-stat mini grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {[
          { label: 'Win Rate',     value: '67.3%', color: '#00E887'  },
          { label: 'Open Trades',  value: '12',    color: '#E8EDF8'  },
          { label: 'Max DD',       value: '-2.1%', color: '#F59E0B'  },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background:   'rgba(0,0,0,0.28)',
              borderRadius: '10px',
              padding:      '11px 12px',
              border:       '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '16px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FundingHero ────────────────────────────────────────────────────────────

export function FundingHero() {
  return (
    <section
      style={{
        position:   'relative',
        zIndex:     1,
        minHeight:  '100vh',
        display:    'flex',
        alignItems: 'center',
        padding:    '120px 32px 100px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* ── Desktop split ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>

          {/* Left: copy column */}
          <div style={{ flex: '0 0 52%' }}>

            {/* Trust pill */}
            <div
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '8px',
                padding:       '6px 14px',
                background:    'rgba(0,232,135,0.08)',
                border:        '1px solid rgba(0,232,135,0.22)',
                borderRadius:  '100px',
                marginBottom:  '36px',
                fontFamily:    'var(--font-geist-mono)',
                fontSize:      '11px',
                color:         '#00E887',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00E887', flexShrink: 0 }}
              />
              Trusted by 3,847 active traders worldwide
            </div>

            {/* Headline */}
            <h1 style={{ margin: '0 0 28px', lineHeight: 0.90 }}>
              <GradientText
                preset="funding"
                as="span"
                style={{
                  display:       'block',
                  fontSize:      'clamp(52px, 7.5vw, 88px)',
                  fontWeight:    900,
                  letterSpacing: '-0.045em',
                }}
              >
                YOUR EDGE.
              </GradientText>
              <GradientText
                preset="hero"
                as="span"
                style={{
                  display:       'block',
                  fontSize:      'clamp(52px, 7.5vw, 88px)',
                  fontWeight:    900,
                  letterSpacing: '-0.045em',
                }}
              >
                OUR CAPITAL.
              </GradientText>
            </h1>

            {/* Body */}
            <p
              style={{
                fontSize:     '18px',
                lineHeight:   1.70,
                color:        '#8895AB',
                maxWidth:     '480px',
                marginBottom: '44px',
              }}
            >
              Trade up to $250,000 of firm capital. Hit your profit targets,
              respect the parameters, and keep up to 90% of every dollar you make.
              No personal capital at risk.
            </p>

            {/* Key stats */}
            <div style={{ display: 'flex', gap: '44px', marginBottom: '52px', flexWrap: 'wrap' }}>
              {[
                { value: '$47.2M', label: 'Capital Deployed', color: '#00E887' },
                { value: '67%',    label: 'Avg Win Rate',     color: '#7C6AF7' },
                { value: '$1.2M',  label: 'Paid This Month',  color: '#E8B84B' },
              ].map(({ value, label, color }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily:        'var(--font-geist-mono)',
                      fontSize:          '30px',
                      fontWeight:        800,
                      color,
                      letterSpacing:     '-0.02em',
                      lineHeight:        1,
                      fontVariantNumeric:'tabular-nums',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize:      '11px',
                      color:         '#4A5E78',
                      marginTop:     '5px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="warm" size="lg" href="#apply">
                Apply Now →
              </Button>
              <Button variant="secondary" size="lg" href="#programs">
                View Programs
              </Button>
            </div>

            {/* Fine print */}
            <p
              style={{
                marginTop:     '20px',
                fontSize:      '12px',
                color:         '#3D4F66',
                letterSpacing: '0.02em',
              }}
            >
              From $99/month · Cancel anytime · Results in 30 days
            </p>
          </div>

          {/* Right: dashboard card (desktop) */}
          <div
            className="hidden lg:block"
            style={{
              flex:     '0 0 48%',
              position: 'relative',
              height:   '600px',
            }}
          >
            {/* Main card — slight rotation for depth */}
            <div
              className="nf-float-0"
              style={{
                position:  'absolute',
                top:       '20px',
                left:      '30px',
                right:     '30px',
                transform: 'rotate(-2.5deg)',
              }}
            >
              <DashboardCard />
            </div>

            {/* Floating chips */}
            <StatChip
              label="Account Size"
              value="$100K"
              valueColor={COLORS.violet}
              floatDelay={1}
              glow="violet"
              className="hidden xl:flex"
              style={{ position: 'absolute', top: '4px', right: '-8px' }}
            />
            <StatChip
              label="Profit Share"
              value="Up to 90%"
              valueColor={COLORS.gold}
              floatDelay={2}
              glow="gold"
              className="hidden xl:flex"
              style={{ position: 'absolute', bottom: '88px', right: '-8px' }}
            />
            <StatChip
              label="Active Traders"
              value="3,847"
              valueColor={COLORS.green}
              floatDelay={0}
              glow="green"
              className="hidden xl:flex"
              style={{ position: 'absolute', bottom: '72px', left: '0px' }}
            />
            <StatChip
              label="Starting From"
              value="$99 / mo"
              valueColor={COLORS.cyan}
              floatDelay={3}
              glow="cyan"
              className="hidden xl:flex"
              style={{ position: 'absolute', top: '8px', left: '4px' }}
            />
          </div>
        </div>

        {/* ── Mobile: simplified card preview ───────────────────────── */}
        <div
          className="lg:hidden"
          style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
          <DashboardCard compact />
          <StatChipRow
            stats={[
              { label: 'Capital Deployed', value: '$47.2M',    color: COLORS.green  },
              { label: 'Profit Share',     value: 'Up to 90%', color: COLORS.gold   },
              { label: 'Active Traders',   value: '3,847',     color: COLORS.violet },
            ]}
          />
        </div>

      </div>
    </section>
  );
}
