/**
 * HowItWorks
 *
 * Three-step horizontal process flow with numbered badges and connector lines.
 * Tinted background panel.
 * Server component.
 */

import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard, GlassCardBody }      from '@/components/neon/GlassCard';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { COLORS, GRADIENTS }             from '@/lib/neon/constants';

interface Step {
  number: string;
  label:  string;
  heading: string;
  body:   string;
  detail: string;        // short callout (e.g. timeframe or key fact)
  detailColor: string;
}

const STEPS: Step[] = [
  {
    number:      '01',
    label:       'Choose',
    heading:     'Pick Your Program',
    body:        'Select an account size from $25K to $250K. Pay a one-time challenge fee. Your evaluation begins immediately — no waiting, no approval queue.',
    detail:      'From $99 / month',
    detailColor: COLORS.cyan,
  },
  {
    number:      '02',
    label:       'Trade',
    heading:     'Pass the Challenge',
    body:        'Hit your profit target while staying within the daily loss and maximum drawdown limits. Trade live markets, your own strategy, your own hours.',
    detail:      '8% profit target',
    detailColor: COLORS.green,
  },
  {
    number:      '03',
    label:       'Get Paid',
    heading:     'Receive Your Funding',
    body:        'Once you pass, you receive a funded account at the same size. Trade it as your own. Withdraw your split weekly, and scale through the tiers as you perform.',
    detail:      'Funded in under 24h',
    detailColor: COLORS.gold,
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" tinted ruled motion={{ delay: 0.05 }}>
      {/* Section header */}
      <SectionHeader
        label={<SectionLabel color="cyan">The Process</SectionLabel>}
        heading={
          <>
            From applicant to{' '}
            <GradientText preset="yield">funded</GradientText>
            {' '}in days.
          </>
        }
        body="Three steps. Clear targets. No ambiguity. You either hit the numbers or you don't — and if you do, you get the capital."
        style={{ marginBottom: '64px' }}
      />

      {/* Steps — horizontal on desktop, vertical on mobile */}
      <div
        style={{
          display:   'flex',
          gap:       '0',
          alignItems:'stretch',
          flexWrap:  'wrap',
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            style={{
              flex:       '1 1 260px',
              display:    'flex',
              alignItems: 'stretch',
              position:   'relative',
            }}
          >
            {/* Card */}
            <GlassCard
              variant="glass"
              style={{
                flex:        1,
                margin:      i === 1 ? '0 24px' : '0',
                position:    'relative',
                overflow:    'hidden',
              }}
            >
              {/* Vertical accent line */}
              <div
                style={{
                  position:   'absolute',
                  top:        0,
                  bottom:     0,
                  left:       0,
                  width:      '2px',
                  background: i === 0
                    ? `linear-gradient(180deg, ${COLORS.cyan} 0%, transparent 100%)`
                    : i === 1
                    ? `linear-gradient(180deg, ${COLORS.green} 0%, transparent 100%)`
                    : `linear-gradient(180deg, ${COLORS.gold} 0%, transparent 100%)`,
                }}
              />

              <GlassCardBody size="lg">
                {/* Step number */}
                <div
                  style={{
                    fontFamily:    'var(--font-geist-mono)',
                    fontSize:      '11px',
                    fontWeight:    600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         i === 0 ? COLORS.cyan : i === 1 ? COLORS.green : COLORS.gold,
                    marginBottom:  '16px',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '8px',
                  }}
                >
                  <span
                    style={{
                      display:        'inline-flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      width:          '28px',
                      height:         '28px',
                      borderRadius:   '8px',
                      background:     i === 0
                        ? 'rgba(34,211,238,0.12)'
                        : i === 1
                        ? 'rgba(0,232,135,0.12)'
                        : 'rgba(232,184,75,0.12)',
                      border:         i === 0
                        ? '1px solid rgba(34,211,238,0.25)'
                        : i === 1
                        ? '1px solid rgba(0,232,135,0.25)'
                        : '1px solid rgba(232,184,75,0.25)',
                      fontSize:       '12px',
                      fontWeight:     800,
                    }}
                  >
                    {step.number}
                  </span>
                  {step.label}
                </div>

                {/* Heading */}
                <h3
                  style={{
                    fontSize:      '22px',
                    fontWeight:    700,
                    letterSpacing: '-0.015em',
                    color:         '#E8EDF8',
                    lineHeight:    1.15,
                    marginBottom:  '14px',
                  }}
                >
                  {step.heading}
                </h3>

                {/* Body */}
                <p
                  style={{
                    fontSize:     '14px',
                    lineHeight:   1.65,
                    color:        '#8895AB',
                    marginBottom: '24px',
                  }}
                >
                  {step.body}
                </p>

                {/* Key detail callout */}
                <div
                  style={{
                    display:       'inline-flex',
                    alignItems:    'center',
                    gap:           '6px',
                    padding:       '6px 12px',
                    background:    `${step.detailColor}11`,
                    border:        `1px solid ${step.detailColor}30`,
                    borderRadius:  '8px',
                    fontFamily:    'var(--font-geist-mono)',
                    fontSize:      '12px',
                    fontWeight:    600,
                    color:         step.detailColor,
                    letterSpacing: '0.02em',
                  }}
                >
                  {step.detail}
                </div>
              </GlassCardBody>
            </GlassCard>

            {/* Connector arrow between steps (desktop only) */}
            {i < STEPS.length - 1 && (
              <div
                className="hidden lg:flex"
                style={{
                  position:       'absolute',
                  right:          '-4px',
                  top:            '50%',
                  transform:      'translateY(-50%)',
                  zIndex:         2,
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          '32px',
                  height:         '32px',
                  borderRadius:   '50%',
                  background:     'rgba(8,13,24,0.95)',
                  border:         '1px solid rgba(255,255,255,0.08)',
                  color:          '#3D4F66',
                  fontSize:       '14px',
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
