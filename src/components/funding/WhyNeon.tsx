/**
 * WhyNeon
 *
 * Four differentiator cards — "not another prop firm" positioning.
 * Asymmetric card sizes and accent colors for visual variety.
 * Server component.
 */

import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard, GlassCardBody }      from '@/components/neon/GlassCard';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { COLORS }                        from '@/lib/neon/constants';

interface Differentiator {
  stat:      string;
  statColor: string;
  heading:   string;
  body:      string;
  accent:    string;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    stat:      '24h',
    statColor: COLORS.green,
    heading:   'Instant Withdrawals.',
    body:      "Most prop firms make you wait 2–7 business days. We process payout requests within 24 hours, every time. Your profits belong to you — we don't hold them hostage.",
    accent:    COLORS.green,
  },
  {
    stat:      '0',
    statColor: COLORS.cyan,
    heading:   'Zero Hidden Rules.',
    body:      'Every parameter, restriction, and edge case is documented in plain language before you pay a cent. No surprises after you pass. Read the rulebook — it fits on one page.',
    accent:    COLORS.cyan,
  },
  {
    stat:      '100%',
    statColor: COLORS.violet,
    heading:   'Live Markets Only.',
    body:      'No paper trading, no simulated fills, no artificial spreads. Your funded account operates on live exchanges at real prices. What you see is what executes.',
    accent:    COLORS.violet,
  },
  {
    stat:      '$2.5M',
    statColor: COLORS.gold,
    heading:   'Merit-Based Scaling.',
    body:      "Start at $25K. Hit two consecutive profitable months and we double your allocation — automatically, no re-challenge required. The ceiling is $2.5M in firm capital.",
    accent:    COLORS.gold,
  },
];

export function WhyNeon() {
  return (
    <SectionWrapper id="why-neon" motion={{ delay: 0.05 }}>
      {/* Section header */}
      <SectionHeader
        label={<SectionLabel color="violet">Why Neon</SectionLabel>}
        heading={
          <>
            We built what we{' '}
            <GradientText preset="brand">wanted to trade with</GradientText>.
          </>
        }
        body="Not a retail product reskinned as a prop firm. Neon Funded was designed from scratch for serious, professional-grade trading."
        style={{ marginBottom: '64px' }}
      />

      {/* 2×2 grid — alternating accent colors */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap:                 '24px',
        }}
      >
        {DIFFERENTIATORS.map((d, i) => (
          <GlassCard
            key={d.heading}
            variant="glass"
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background glow bleed */}
            <div
              aria-hidden
              style={{
                position:   'absolute',
                top:        '-40px',
                right:      '-40px',
                width:      '120px',
                height:     '120px',
                borderRadius:'50%',
                background: `radial-gradient(circle, ${d.accent}18 0%, transparent 70%)`,
                pointerEvents:'none',
              }}
            />

            <GlassCardBody size="lg" style={{ position: 'relative' }}>
              {/* Large stat number */}
              <div
                style={{
                  fontFamily:        'var(--font-geist-mono)',
                  fontSize:          '56px',
                  fontWeight:        900,
                  letterSpacing:     '-0.04em',
                  lineHeight:        1,
                  color:             d.statColor,
                  marginBottom:      '16px',
                  fontVariantNumeric:'tabular-nums',
                }}
              >
                {d.stat}
              </div>

              {/* Heading */}
              <h3
                style={{
                  fontSize:      '20px',
                  fontWeight:    700,
                  letterSpacing: '-0.012em',
                  color:         '#E8EDF8',
                  lineHeight:    1.2,
                  marginBottom:  '14px',
                }}
              >
                {d.heading}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize:   '14px',
                  lineHeight: 1.65,
                  color:      '#8895AB',
                }}
              >
                {d.body}
              </p>

              {/* Bottom accent line */}
              <div
                style={{
                  position:   'absolute',
                  bottom:     0,
                  left:       0,
                  right:      0,
                  height:     '2px',
                  background: `linear-gradient(90deg, ${d.accent} 0%, transparent 60%)`,
                  borderRadius:'0 0 20px 20px',
                }}
              />
            </GlassCardBody>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
