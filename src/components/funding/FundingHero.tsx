/**
 * FundingHero
 *
 * Hero layout inspired by clean prop-firm reference designs:
 * Left column: headline + body + CTAs + trust signal + review badges.
 * Right column (desktop): browser window mockup with live dashboard inside.
 * Mobile: single column, mockup stacks below copy.
 *
 * Server component — Button handles its own client boundary.
 */

import { Button }          from '@/components/neon/Button';
import { GradientText }    from '@/components/neon/GradientText';
import { COLORS, GRADIENTS, SHADOWS } from '@/lib/neon/constants';

// ── Browser window mockup ─────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div
      style={{
        borderRadius:  '14px',
        overflow:      'hidden',
        background:    'rgba(8,13,24,0.98)',
        border:        '1px solid rgba(255,255,255,0.10)',
        boxShadow:     `${SHADOWS.liftXl}, 0 0 80px rgba(124,106,247,0.18)`,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background:   'rgba(6,10,18,0.99)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding:      '11px 16px',
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
        }}
      >
        {/* Traffic light dots */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        {/* URL bar */}
        <div
          style={{
            flex:         1,
            background:   'rgba(255,255,255,0.05)',
            border:       '1px solid rgba(255,255,255,0.07)',
            borderRadius: '6px',
            padding:      '5px 12px',
            fontFamily:   'var(--font-geist-mono)',
            fontSize:     '11px',
            color:        '#4A5E78',
            display:      'flex',
            alignItems:   'center',
            gap:          '7px',
          }}
        >
          <span style={{ color: COLORS.green, fontSize: '8px', lineHeight: 1 }}>●</span>
          app.neonfunded.com/dashboard
        </div>
      </div>

      {/* ── Dashboard ── */}

      {/* Gradient header area */}
      <div
        style={{
          background: GRADIENTS.brandPrimary,
          padding:    '20px 24px 18px',
          position:   'relative',
          overflow:   'hidden',
        }}
      >
        {/* Subtle noise overlay */}
        <div
          aria-hidden
          style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.10) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '5px' }}>Dashboard</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Welcome back, Alex</div>
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
            Trading Day Ends In{' '}
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>12:33:48</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display:    'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {[
          { label: 'Total Withdrawals', value: '$47,200', sub: 'vs USDT',     cta: null },
          { label: 'Pending Payouts',   value: '4',       sub: '$1,200 total', cta: 'Go To Payouts →' },
        ].map(({ label, value, sub, cta }, i) => (
          <div
            key={label}
            style={{
              padding:     '16px 20px',
              borderRight: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: cta ? '6px' : 0 }}>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '22px', fontWeight: 800, color: '#E8EDF8', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </span>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#4A5E78' }}>{sub}</span>
            </div>
            {cta && (
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: COLORS.violet, letterSpacing: '0.02em', cursor: 'pointer' }}>
                {cta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Challenges section */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', fontWeight: 600, color: '#8895AB', letterSpacing: '0.04em' }}>
            Ongoing Challenges{' '}
            <span style={{ color: COLORS.violet }}>2</span>
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78' }}>
            View all →
          </div>
        </div>

        {/* Challenge card */}
        <div
          style={{
            background:   'rgba(124,106,247,0.08)',
            border:       '1px solid rgba(124,106,247,0.18)',
            borderRadius: '10px',
            padding:      '14px 16px',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: COLORS.violet, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '3px' }}>
                NEON CHALLENGE
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#E8EDF8', letterSpacing: '-0.01em' }}>$100,000 PRO</div>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#4A5E78', marginTop: '2px' }}>Created 09-07-2025</div>
            </div>
            <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
              {[['Balance', '$102,480'], ['Profit', '+2,480'], ['Day', '14']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', color: '#4A5E78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{l}</div>
                  <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '14px', fontWeight: 800, color: l === 'Profit' ? COLORS.green : '#E8EDF8', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '62%', background: GRADIENTS.brandPrimary, borderRadius: '2px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontFamily: 'var(--font-geist-mono)', fontSize: '9px', color: '#4A5E78' }}>
            <span>Profit progress</span><span style={{ color: COLORS.violet }}>62% to target</span>
          </div>
        </div>

        {/* Second challenge — compact */}
        <div
          style={{
            background:   'rgba(0,232,135,0.06)',
            border:       '1px solid rgba(0,232,135,0.14)',
            borderRadius: '10px',
            padding:      '12px 16px',
            display:      'flex',
            justifyContent: 'space-between',
            alignItems:   'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: COLORS.green, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '2px' }}>NEON CHALLENGE</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF8' }}>$25,000 STARTER</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[['Balance', '$25,840'], ['Profit', '+840']].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', color: '#4A5E78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '13px', fontWeight: 700, color: l === 'Profit' ? COLORS.green : '#E8EDF8', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review badge ───────────────────────────────────────────────────────────

function ReviewBadge({
  logo,
  rating,
  count,
  logoColor,
}: {
  logo: string;
  rating: string;
  count: string;
  logoColor: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Logo circle */}
      <div
        style={{
          width:          '32px',
          height:         '32px',
          borderRadius:   '50%',
          background:     logoColor,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontWeight:     900,
          fontSize:       '14px',
          color:          '#FFFFFF',
          flexShrink:     0,
          boxShadow:      `0 0 12px ${logoColor}55`,
        }}
      >
        {logo}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '14px', fontWeight: 800, color: '#E8EDF8', letterSpacing: '-0.01em', lineHeight: 1 }}>
          {rating}
        </div>
        <div style={{ fontSize: '11px', color: '#4A5E78', marginTop: '2px', lineHeight: 1 }}>{count}</div>
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
        padding:    '100px 32px 80px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* Desktop two-column layout */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '72px',
          }}
        >

          {/* ── Left: copy column ─────────────────────────────────── */}
          <div style={{ flex: '0 0 44%', minWidth: 0 }}>

            {/* Eyebrow */}
            <div
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '8px',
                padding:       '5px 14px',
                background:    'rgba(124,106,247,0.08)',
                border:        '1px solid rgba(124,106,247,0.25)',
                borderRadius:  '100px',
                marginBottom:  '28px',
                fontFamily:    'var(--font-geist-mono)',
                fontSize:      '11px',
                color:         COLORS.violet,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: COLORS.violet, flexShrink: 0 }} />
              #1 Crypto Prop Firm
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize:      'clamp(38px, 4.8vw, 62px)',
                fontWeight:    900,
                lineHeight:    1.06,
                letterSpacing: '-0.03em',
                color:         '#E8EDF8',
                marginBottom:  '24px',
              }}
            >
              Crypto Prop Firm<br />
              Built For{' '}
              <GradientText preset="brand" as="span">
                Elite Traders
              </GradientText>
            </h1>

            {/* Body */}
            <p
              style={{
                fontSize:     '17px',
                lineHeight:   1.70,
                color:        '#8895AB',
                maxWidth:     '440px',
                marginBottom: '36px',
              }}
            >
              Trade up to $250,000 in firm capital. Use live crypto markets and
              keep up to 90% of every dollar you generate. No personal funds at risk.
            </p>

            {/* CTA buttons */}
            <div
              style={{
                display:     'flex',
                gap:         '14px',
                alignItems:  'center',
                flexWrap:    'wrap',
                marginBottom:'20px',
              }}
            >
              <Button variant="warm" size="lg" href="#programs">
                Get Started →
              </Button>
              <Button variant="secondary" size="lg" href="#programs">
                Free Trial
              </Button>
            </div>

            {/* Trust signal */}
            <div
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '8px',
                marginBottom:'32px',
                fontSize:    '13px',
                color:       '#4A5E78',
              }}
            >
              <span style={{ fontSize: '16px' }}>💬</span>
              Join{' '}
              <span style={{ color: '#8895AB', fontWeight: 600 }}>3,847 traders</span>
              {' '}in our Discord community
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '28px', maxWidth: '400px' }} />

            {/* Review badges */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <ReviewBadge
                  logo="G"
                  rating="4.7/5"
                  count="210 reviews"
                  logoColor="linear-gradient(135deg, #4285F4 0%, #34A853 50%, #EA4335 100%)"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <ReviewBadge
                  logo="★"
                  rating="4.3/5"
                  count="191 reviews"
                  logoColor="linear-gradient(135deg, #00B67A 0%, #007B52 100%)"
                />
              </div>
            </div>
          </div>

          {/* ── Right: browser mockup (desktop) ───────────────────── */}
          <div
            className="hidden lg:block"
            style={{
              flex:     '1 1 0',
              minWidth: 0,
            }}
          >
            <BrowserMockup />
          </div>
        </div>

        {/* Mobile: mockup stacks below copy */}
        <div
          className="lg:hidden"
          style={{ marginTop: '48px' }}
        >
          <BrowserMockup />
        </div>

      </div>
    </section>
  );
}
