/**
 * KeyBenefits
 *
 * "The Neon Advantage" — four benefit cards in a 2×2 grid.
 * Each card has a glowing icon area, headline, and 2-line body.
 * Server component.
 */

import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard, GlassCardBody }      from '@/components/neon/GlassCard';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { COLORS }                        from '@/lib/neon/constants';

interface Benefit {
  icon:     string;    // emoji-style single char or short symbol
  iconBg:   string;    // rgba background for icon area
  iconGlow: string;    // box-shadow glow
  accent:   string;    // top-edge line color
  heading:  string;
  body:     string;
}

const BENEFITS: Benefit[] = [
  {
    icon:     '◈',
    iconBg:   'rgba(124,106,247,0.12)',
    iconGlow: '0 0 24px rgba(124,106,247,0.25)',
    accent:   COLORS.violet,
    heading:  'Real Capital. Zero Personal Risk.',
    body:     'Trade with firm capital from day one. Your own money stays untouched — every position, every loss, is on us. Your only job is to perform.',
  },
  {
    icon:     '⬡',
    iconBg:   'rgba(0,232,135,0.10)',
    iconGlow: '0 0 24px rgba(0,232,135,0.20)',
    accent:   COLORS.green,
    heading:  'Scale to $2.5M in Funding.',
    body:     'Start at $25K and grow through our merit-based scaling ladder. No re-challenges, no new fees — pure progression based on your results.',
  },
  {
    icon:     '◆',
    iconBg:   'rgba(232,184,75,0.10)',
    iconGlow: '0 0 24px rgba(232,184,75,0.20)',
    accent:   COLORS.gold,
    heading:  'Keep Up to 90% of Profits.',
    body:     'Our split starts at 80% and grows to 90% as you scale. Weekly withdrawal requests, processed within 24 hours. No lock-up periods.',
  },
  {
    icon:     '▲',
    iconBg:   'rgba(34,211,238,0.10)',
    iconGlow: '0 0 24px rgba(34,211,238,0.18)',
    accent:   COLORS.cyan,
    heading:  'Trade Your Way, No Restrictions.',
    body:     'Hold through news, trade overnight, use your own strategy. The only rules are our risk parameters — everything else is your decision.',
  },
];

export function KeyBenefits() {
  return (
    <SectionWrapper id="benefits" motion={{ delay: 0.05 }}>
      {/* Section header */}
      <SectionHeader
        label={<SectionLabel color="violet">The Neon Advantage</SectionLabel>}
        heading={
          <>
            Everything serious traders{' '}
            <GradientText preset="yield">need</GradientText>.
          </>
        }
        body="Built around one principle: if you can trade, we'll fund it. No gimmicks. No gotcha rules. Just capital, tools, and a fair split."
        style={{ marginBottom: '64px' }}
      />

      {/* 2×2 benefit grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                 '24px',
        }}
      >
        {BENEFITS.map((b) => (
          <GlassCard key={b.heading} variant="glass" glow="none">
            {/* Accent top edge */}
            <div
              style={{
                height:     '2px',
                background: `linear-gradient(90deg, ${b.accent} 0%, transparent 70%)`,
                borderRadius: '20px 20px 0 0',
              }}
            />
            <GlassCardBody size="lg">
              {/* Icon */}
              <div
                style={{
                  width:         '48px',
                  height:        '48px',
                  borderRadius:  '12px',
                  background:    b.iconBg,
                  boxShadow:     b.iconGlow,
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  fontSize:      '20px',
                  color:         b.accent,
                  marginBottom:  '24px',
                  border:        `1px solid ${b.accent}22`,
                }}
              >
                {b.icon}
              </div>

              {/* Heading */}
              <h3
                style={{
                  fontSize:      '18px',
                  fontWeight:    700,
                  letterSpacing: '-0.01em',
                  color:         '#E8EDF8',
                  lineHeight:    1.2,
                  marginBottom:  '12px',
                }}
              >
                {b.heading}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize:   '14px',
                  lineHeight: 1.65,
                  color:      '#8895AB',
                }}
              >
                {b.body}
              </p>
            </GlassCardBody>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
