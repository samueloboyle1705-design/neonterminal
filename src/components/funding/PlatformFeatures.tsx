/**
 * PlatformFeatures
 *
 * Asymmetric 2-col section: feature list on the left,
 * CSS-rendered platform mock on the right.
 * Tinted background panel.
 * Server component.
 */

import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard }                     from '@/components/neon/GlassCard';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { LiveBadge }                     from '@/components/neon/LiveBadge';
import { COLORS }                        from '@/lib/neon/constants';

const FEATURES = [
  {
    icon:    '◉',
    color:   COLORS.green,
    heading: 'Live Market Execution',
    body:    'Real fills at live prices. No simulation, no artificial spreads.',
  },
  {
    icon:    '◈',
    color:   COLORS.violet,
    heading: 'Advanced Order Types',
    body:    'Market, limit, stop-limit, OCO — everything a serious strategy needs.',
  },
  {
    icon:    '◆',
    color:   COLORS.gold,
    heading: 'Real-Time Risk Dashboard',
    body:    'Live P&L, drawdown tracking, daily loss meter — always visible.',
  },
  {
    icon:    '▲',
    color:   COLORS.cyan,
    heading: 'Multi-Asset Coverage',
    body:    'Crypto perpetuals, spot, forex majors, and commodities in one account.',
  },
  {
    icon:    '⬡',
    color:   COLORS.green,
    heading: 'Mobile-First Trading App',
    body:    'Full functionality on iOS and Android. Manage positions anywhere.',
  },
  {
    icon:    '◇',
    color:   COLORS.violet,
    heading: 'Automated Payout Requests',
    body:    'Request a withdrawal with one tap. Processed within 24 hours.',
  },
] as const;

// ── CSS-only platform mock ────────────────────────────────────────────────

function PlatformMock() {
  // Simulated candlestick bars (heights represent OHLC visual)
  const bars = [
    { h: 52, isUp: false },
    { h: 68, isUp: true  },
    { h: 45, isUp: false },
    { h: 78, isUp: true  },
    { h: 60, isUp: true  },
    { h: 83, isUp: true  },
    { h: 55, isUp: false },
    { h: 90, isUp: true  },
    { h: 72, isUp: true  },
    { h: 96, isUp: true  },
    { h: 80, isUp: false },
    { h: 88, isUp: true  },
  ];

  return (
    <GlassCard
      variant="glass"
      style={{
        overflow: 'hidden',
        border:   '1px solid rgba(0,232,135,0.12)',
      }}
    >
      {/* Terminal topbar */}
      <div
        style={{
          padding:        '14px 20px',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          background:     'rgba(0,0,0,0.20)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily:    'var(--font-geist-mono)',
              fontSize:      '13px',
              fontWeight:    700,
              color:         '#E8EDF8',
              letterSpacing: '-0.01em',
            }}
          >
            BTC/USDT
          </span>
          <span
            style={{
              fontFamily:    'var(--font-geist-mono)',
              fontSize:      '13px',
              fontWeight:    800,
              color:         '#00E887',
              letterSpacing: '-0.01em',
            }}
          >
            $97,420.50
          </span>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize:   '11px',
              color:      '#00E887',
              padding:    '2px 8px',
              background: 'rgba(0,232,135,0.10)',
              border:     '1px solid rgba(0,232,135,0.20)',
              borderRadius:'5px',
            }}
          >
            +2.14%
          </span>
        </div>
        <LiveBadge size="sm" />
      </div>

      {/* Chart area */}
      <div
        style={{
          padding:    '20px',
          background: 'rgba(0,0,0,0.12)',
          borderBottom:'1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Candlestick bars */}
        <div
          style={{
            display:    'flex',
            alignItems: 'flex-end',
            gap:        '6px',
            height:     '100px',
            padding:    '0 4px',
          }}
        >
          {bars.map(({ h, isUp }, i) => (
            <div
              key={i}
              style={{
                flex:         1,
                height:       `${h}%`,
                borderRadius: '3px 3px 1px 1px',
                background:   isUp
                  ? 'rgba(0,232,135,0.75)'
                  : 'rgba(255,59,92,0.65)',
                boxShadow:    isUp
                  ? '0 0 6px rgba(0,232,135,0.25)'
                  : '0 0 6px rgba(255,59,92,0.20)',
              }}
            />
          ))}
        </div>
        {/* Chart label */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            marginTop:      '8px',
            fontFamily:     'var(--font-geist-mono)',
            fontSize:       '9px',
            color:          '#3D4F66',
            letterSpacing:  '0.06em',
          }}
        >
          <span>1H</span>
          <span>4H</span>
          <span>1D</span>
          <span>LIVE</span>
        </div>
      </div>

      {/* Open position row */}
      <div
        style={{
          padding:      '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display:      'flex',
          justifyContent:'space-between',
          alignItems:   'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily:    'var(--font-geist-mono)',
              fontSize:      '10px',
              color:         '#4A5E78',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom:  '4px',
            }}
          >
            Open Position
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize:   '13px',
                fontWeight: 700,
                color:      '#E8EDF8',
              }}
            >
              BTC/USDT LONG
            </span>
            <span
              style={{
                fontFamily:    'var(--font-geist-mono)',
                fontSize:      '11px',
                color:         '#00E887',
                padding:       '1px 8px',
                background:    'rgba(0,232,135,0.08)',
                border:        '1px solid rgba(0,232,135,0.18)',
                borderRadius:  '4px',
                letterSpacing: '0.04em',
              }}
            >
              10×
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily:    'var(--font-geist-mono)',
              fontSize:      '10px',
              color:         '#4A5E78',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom:  '4px',
            }}
          >
            Unrealised P&L
          </div>
          <div
            style={{
              fontFamily:    'var(--font-geist-mono)',
              fontSize:      '16px',
              fontWeight:    800,
              color:         '#00E887',
              letterSpacing: '-0.01em',
            }}
          >
            +$1,247.80
          </div>
        </div>
      </div>

      {/* Account metrics row */}
      <div
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap:     '0',
        }}
      >
        {[
          { label: 'Balance',    value: '$102,480', color: '#E8EDF8' },
          { label: 'Daily P&L',  value: '+$824',   color: COLORS.green },
          { label: 'Drawdown',   value: '1.8%',    color: COLORS.amber },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            style={{
              borderRight:   i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              padding:       '0 16px',
              paddingLeft:   i === 0 ? 0 : '16px',
            }}
          >
            <div
              style={{
                fontFamily:    'var(--font-geist-mono)',
                fontSize:      '10px',
                color:         '#4A5E78',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom:  '4px',
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily:        'var(--font-geist-mono)',
                fontSize:          '14px',
                fontWeight:        700,
                color,
                fontVariantNumeric:'tabular-nums',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── PlatformFeatures ───────────────────────────────────────────────────────

export function PlatformFeatures() {
  return (
    <SectionWrapper id="features" tinted ruled motion={{ delay: 0.05 }}>
      <div
        style={{
          display:   'flex',
          gap:       '80px',
          alignItems:'center',
          flexWrap:  'wrap',
        }}
      >
        {/* Left: feature list */}
        <div style={{ flex: '1 1 320px' }}>
          <SectionHeader
            label={<SectionLabel color="violet">The Platform</SectionLabel>}
            heading={
              <>
                Built for{' '}
                <GradientText preset="brand">performance</GradientText>.
              </>
            }
            body="Every tool a serious trader needs. Nothing you don't."
            style={{ marginBottom: '48px' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {FEATURES.map(({ icon, color, heading, body }) => (
              <div
                key={heading}
                style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
              >
                {/* Icon mark */}
                <div
                  style={{
                    flexShrink:     0,
                    width:          '36px',
                    height:         '36px',
                    borderRadius:   '9px',
                    background:     `${color}14`,
                    border:         `1px solid ${color}28`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       '14px',
                    color,
                    marginTop:      '2px',
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize:      '15px',
                      fontWeight:    600,
                      color:         '#E8EDF8',
                      letterSpacing: '-0.008em',
                      marginBottom:  '4px',
                    }}
                  >
                    {heading}
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#8895AB' }}>
                    {body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: platform mock */}
        <div style={{ flex: '1 1 400px' }}>
          <PlatformMock />
        </div>
      </div>
    </SectionWrapper>
  );
}
