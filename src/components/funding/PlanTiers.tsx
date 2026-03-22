/**
 * PlanTiers
 *
 * Three challenge/program option cards: Starter, Professional, Elite.
 * Professional is the flagship — rendered with gradient border and glow.
 * Server component.
 */

import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard, GlassCardBody }      from '@/components/neon/GlassCard';
import { TierBadge }                     from '@/components/neon/Badge';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { Button }                        from '@/components/neon/Button';
import { COLORS, GRADIENTS }             from '@/lib/neon/constants';

interface PlanRule {
  label: string;
  value: string;
  highlight?: boolean;
}

interface Plan {
  tier:         'starter' | 'pro' | 'elite';
  accountSize:  string;
  fee:          string;
  feePeriod:    string;
  profitShare:  string;
  rules:        PlanRule[];
  ctaLabel:     string;
  ctaVariant:   'primary' | 'warm' | 'secondary';
  flagship?:    boolean;
}

const PLANS: Plan[] = [
  {
    tier:        'starter',
    accountSize: '$25,000',
    fee:         '$99',
    feePeriod:   'per month',
    profitShare: '80%',
    rules: [
      { label: 'Profit Target',    value: '8%'  },
      { label: 'Max Drawdown',     value: '5%'  },
      { label: 'Daily Loss Limit', value: '3%'  },
      { label: 'Max Leverage',     value: '1:10' },
      { label: 'Minimum Days',     value: '5'   },
      { label: 'News Trading',     value: 'Allowed' },
    ],
    ctaLabel:   'Start Starter',
    ctaVariant: 'secondary',
  },
  {
    tier:        'pro',
    accountSize: '$100,000',
    fee:         '$299',
    feePeriod:   'per month',
    profitShare: '85%',
    flagship:    true,
    rules: [
      { label: 'Profit Target',    value: '8%',  highlight: true },
      { label: 'Max Drawdown',     value: '5%'   },
      { label: 'Daily Loss Limit', value: '3%'   },
      { label: 'Max Leverage',     value: '1:20', highlight: true },
      { label: 'Minimum Days',     value: '5'    },
      { label: 'News Trading',     value: 'Allowed' },
    ],
    ctaLabel:   'Apply Now',
    ctaVariant: 'warm',
  },
  {
    tier:        'elite',
    accountSize: '$250,000',
    fee:         '$499',
    feePeriod:   'per month',
    profitShare: '90%',
    rules: [
      { label: 'Profit Target',    value: '10%', highlight: true },
      { label: 'Max Drawdown',     value: '5%'  },
      { label: 'Daily Loss Limit', value: '3%'  },
      { label: 'Max Leverage',     value: '1:50', highlight: true },
      { label: 'Minimum Days',     value: '5'   },
      { label: 'News Trading',     value: 'Allowed' },
    ],
    ctaLabel:   'Apply Elite',
    ctaVariant: 'secondary',
  },
];

// ── Single plan card ───────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  const { tier, accountSize, fee, feePeriod, profitShare, rules, ctaLabel, ctaVariant, flagship } = plan;

  const card = (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Tier badge */}
      <div style={{ marginBottom: '20px' }}>
        <TierBadge tier={tier} />
      </div>

      {/* Account size */}
      <div
        style={{
          fontFamily:        'var(--font-geist-mono)',
          fontSize:          '40px',
          fontWeight:        800,
          letterSpacing:     '-0.03em',
          lineHeight:        1,
          marginBottom:      '4px',
          fontVariantNumeric:'tabular-nums',
          background:        flagship ? GRADIENTS.brandWarm : 'none',
          WebkitBackgroundClip: flagship ? 'text' : undefined,
          WebkitTextFillColor:  flagship ? 'transparent' : '#E8EDF8',
          backgroundClip:    flagship ? 'text' : undefined,
          color:             flagship ? undefined : '#E8EDF8',
        }}
      >
        {accountSize}
      </div>
      <div
        style={{
          fontFamily:    'var(--font-geist-mono)',
          fontSize:      '12px',
          color:         '#4A5E78',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom:  '28px',
        }}
      >
        Funded account
      </div>

      {/* Fee */}
      <div
        style={{
          display:      'flex',
          alignItems:   'baseline',
          gap:          '6px',
          marginBottom: '32px',
          paddingBottom:'28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize:   '36px',
            fontWeight: 800,
            letterSpacing:'-0.025em',
            color:      '#E8EDF8',
          }}
        >
          {fee}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize:   '13px',
            color:      '#4A5E78',
          }}
        >
          {feePeriod}
        </span>
      </div>

      {/* Rules list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        {rules.map(({ label, value, highlight }) => (
          <div
            key={label}
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
            }}
          >
            <span style={{ fontSize: '13px', color: '#8895AB' }}>{label}</span>
            <span
              style={{
                fontFamily:    'var(--font-geist-mono)',
                fontSize:      '13px',
                fontWeight:    highlight ? 700 : 500,
                color:         highlight
                  ? (tier === 'pro' ? COLORS.gold : COLORS.green)
                  : '#E8EDF8',
                letterSpacing: '0',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Profit share highlight */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          padding:      '14px 16px',
          background:   flagship
            ? 'rgba(232,184,75,0.08)'
            : 'rgba(0,232,135,0.06)',
          border:       flagship
            ? '1px solid rgba(232,184,75,0.18)'
            : '1px solid rgba(0,232,135,0.12)',
          borderRadius: '10px',
          marginBottom: '24px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#8895AB' }}>Your profit split</span>
        <span
          style={{
            fontFamily:    'var(--font-geist-mono)',
            fontSize:      '20px',
            fontWeight:    800,
            color:         flagship ? COLORS.gold : COLORS.green,
            letterSpacing: '-0.01em',
          }}
        >
          {profitShare}
        </span>
      </div>

      {/* CTA */}
      <Button variant={ctaVariant} size="md" href="#apply" fullWidth>
        {ctaLabel} →
      </Button>
    </div>
  );

  if (flagship) {
    return (
      <GlassCard variant="glass-elevated" glow="violet" glowBorderVariant="funding" fullHeight>
        {card}
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="glass" fullHeight style={{ position: 'relative' }}>
      {card}
    </GlassCard>
  );
}

// ── PlanTiers ─────────────────────────────────────────────────────────────

export function PlanTiers() {
  return (
    <SectionWrapper id="programs" motion={{ delay: 0.05 }}>
      {/* Section header */}
      <SectionHeader
        label={<SectionLabel color="gold">Choose Your Program</SectionLabel>}
        heading={
          <>
            Funding sizes for{' '}
            <GradientText preset="funding">every level</GradientText>.
          </>
        }
        body="Start where you're comfortable. Scale to where you deserve to be. All programs have identical rules — only the size changes."
        style={{ marginBottom: '56px' }}
      />

      {/* Three-column plan grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                 '24px',
          alignItems:          'stretch',
        }}
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.tier} plan={plan} />
        ))}
      </div>

      {/* Fine print */}
      <p
        style={{
          marginTop:     '32px',
          textAlign:     'center',
          fontSize:      '12px',
          color:         '#3D4F66',
          letterSpacing: '0.02em',
        }}
      >
        All programs include: live market access · real-time data · risk dashboard · weekly payouts
        · no time limit to pass
      </p>
    </SectionWrapper>
  );
}
