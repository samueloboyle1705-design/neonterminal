/**
 * FundingCTA
 *
 * Full-bleed final call-to-action section.
 * Deep gradient background, centered layout, dual CTAs,
 * and trust signals below.
 * Server component.
 */

import { GradientText } from '@/components/neon/GradientText';
import { Button }       from '@/components/neon/Button';
import { COLORS }       from '@/lib/neon/constants';

const TRUST_SIGNALS = [
  '3,847 traders funded',
  'From $99 / month',
  'Cancel any time',
  '24h payouts',
  'Live markets',
] as const;

export function FundingCTA() {
  return (
    <section
      id="apply"
      style={{
        position: 'relative',
        zIndex:   1,
        overflow: 'hidden',
      }}
    >
      {/* Local background — deeper, more saturated than page */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          inset:      0,
          background: [
            'radial-gradient(ellipse 80% 100% at 50% 120%, rgba(124,106,247,0.25) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 60% at 20% -10%, rgba(0,232,135,0.12) 0%, transparent 55%)',
            'radial-gradient(ellipse 60% 60% at 80% -10%, rgba(232,184,75,0.10) 0%, transparent 55%)',
            'rgba(4,8,15,0.95)',
          ].join(', '),
        }}
      />

      {/* Top border glow */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,106,247,0.6) 30%, rgba(232,184,75,0.4) 60%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position:       'relative',
          zIndex:         1,
          maxWidth:       '720px',
          margin:         '0 auto',
          padding:        '120px 32px',
          textAlign:      'center',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            '0',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '8px',
            padding:       '5px 14px',
            background:    'rgba(124,106,247,0.10)',
            border:        '1px solid rgba(124,106,247,0.25)',
            borderRadius:  '100px',
            marginBottom:  '36px',
            fontFamily:    'var(--font-geist-mono)',
            fontSize:      '11px',
            color:         COLORS.violet,
            letterSpacing: '0.10em',
            textTransform: 'uppercase' as const,
          }}
        >
          <span
            style={{ width: '5px', height: '5px', borderRadius: '50%', background: COLORS.violet, display: 'inline-block' }}
          />
          Your challenge starts today
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize:      'clamp(40px, 6vw, 64px)',
            fontWeight:    900,
            letterSpacing: '-0.04em',
            lineHeight:    0.95,
            marginBottom:  '24px',
          }}
        >
          <GradientText preset="funding" as="span" style={{ display: 'block' }}>
            Start trading
          </GradientText>
          <GradientText preset="hero" as="span" style={{ display: 'block' }}>
            with firm capital.
          </GradientText>
        </h2>

        {/* Sub */}
        <p
          style={{
            fontSize:     '17px',
            lineHeight:   1.65,
            color:        '#8895AB',
            maxWidth:     '520px',
            marginBottom: '48px',
          }}
        >
          3,847 traders are already funded. Apply in minutes — your challenge account
          activates immediately after payment.
        </p>

        {/* CTAs */}
        <div
          style={{
            display:     'flex',
            gap:         '16px',
            flexWrap:    'wrap',
            justifyContent:'center',
            marginBottom:'40px',
          }}
        >
          <Button variant="warm" size="lg" href="#programs">
            Apply Now →
          </Button>
          <Button variant="secondary" size="lg" href="#programs">
            Compare Programs
          </Button>
        </div>

        {/* Trust signal row */}
        <div
          style={{
            display:     'flex',
            gap:         '0',
            flexWrap:    'wrap',
            justifyContent:'center',
            borderTop:   '1px solid rgba(255,255,255,0.06)',
            paddingTop:  '32px',
            width:       '100%',
          }}
        >
          {TRUST_SIGNALS.map((signal, i) => (
            <div
              key={signal}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '8px',
                padding:    '0 20px',
                borderRight: i < TRUST_SIGNALS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <span
                style={{
                  width:        '4px',
                  height:       '4px',
                  borderRadius: '50%',
                  background:   COLORS.green,
                  display:      'inline-block',
                  flexShrink:   0,
                }}
              />
              <span
                style={{
                  fontFamily:    'var(--font-geist-mono)',
                  fontSize:      '11px',
                  color:         '#8895AB',
                  letterSpacing: '0.04em',
                  whiteSpace:    'nowrap' as const,
                }}
              >
                {signal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
