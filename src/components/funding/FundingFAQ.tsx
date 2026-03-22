/**
 * FundingFAQ
 *
 * Accordion FAQ section. AnimatePresence for smooth open/close.
 * Client component — requires useState for open/close state.
 */

'use client';

import { useState }                      from 'react';
import { motion, AnimatePresence }       from 'framer-motion';
import { SectionWrapper, SectionHeader } from '@/components/neon/SectionWrapper';
import { GlassCard }                     from '@/components/neon/GlassCard';
import { SectionLabel }                  from '@/components/neon/SectionLabel';
import { GradientText }                  from '@/components/neon/GradientText';
import { COLORS }                        from '@/lib/neon/constants';

interface FAQItem {
  question: string;
  answer:   string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does the Neon Funded challenge work?',
    answer:
      'You pay a monthly entry fee and receive a simulated account at your chosen size. Trade it like your own. If you hit the profit target (8% for Starter/Pro, 10% for Elite) while staying within the drawdown parameters — max drawdown 5%, daily loss limit 3% — you pass and receive a live funded account.',
  },
  {
    question: 'How quickly can I get funded after passing?',
    answer:
      'Once you pass the challenge, your funded account is provisioned within 24 hours. We verify your pass, sign your agreement, and activate your account. There is no second evaluation phase — pass once, trade funded.',
  },
  {
    question: 'What instruments can I trade?',
    answer:
      'All funded accounts have access to crypto perpetuals (BTC, ETH, SOL and 40+ pairs), spot crypto, forex majors, and key commodities including gold and oil. Instrument availability may vary by account tier.',
  },
  {
    question: 'When and how do payouts work?',
    answer:
      'You can request a payout weekly, every Monday. Minimum withdrawal is $100. We process all requests within 24 hours. Payouts are issued in USDT or via wire transfer depending on your region. There are no withdrawal fees from our side.',
  },
  {
    question: 'Is there a scaling program?',
    answer:
      'Yes. After two consecutive profitable months on your funded account, your allocation doubles automatically — no re-challenge, no additional fees. The progression runs from $25K through to a maximum of $2.5M in firm capital.',
  },
  {
    question: 'What happens if I breach a rule?',
    answer:
      'If you breach the daily loss limit or maximum drawdown on your challenge account, the account is closed and the challenge ends. You can restart with a new challenge at any time. On a funded account, a breach triggers a temporary suspension and review — your earned profits up to that point are protected.',
  },
  {
    question: 'Can I trade during news events?',
    answer:
      'Yes. Unlike many prop firms, we do not restrict trading around scheduled news events. You can hold positions through FOMC, NFP, CPI, and any other economic release. The only rules are the risk parameters — how you get there is your business.',
  },
  {
    question: 'Is there a monthly fee after I am funded?',
    answer:
      'No. Once you are funded, there are no ongoing fees. Your challenge fee covers the evaluation period only. The funded account itself has no monthly charge — we make money from our share of your profits, which means we are incentivised to keep you trading successfully.',
  },
];

// ── Single FAQ row ─────────────────────────────────────────────────────────

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow:     'hidden',
      }}
    >
      {/* Question button */}
      <button
        onClick={onToggle}
        style={{
          width:          '100%',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '22px 28px',
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          textAlign:      'left',
          gap:            '24px',
        }}
      >
        <span
          style={{
            fontSize:      '16px',
            fontWeight:    isOpen ? 600 : 500,
            color:         isOpen ? '#E8EDF8' : '#8895AB',
            lineHeight:    1.4,
            letterSpacing: '-0.008em',
            transition:    'color 150ms ease',
          }}
        >
          {item.question}
        </span>

        {/* Plus / minus icon */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
          style={{
            flexShrink:  0,
            display:     'inline-flex',
            alignItems:  'center',
            justifyContent:'center',
            width:       '28px',
            height:      '28px',
            borderRadius:'8px',
            background:  isOpen ? 'rgba(124,106,247,0.12)' : 'rgba(255,255,255,0.05)',
            border:      isOpen ? '1px solid rgba(124,106,247,0.30)' : '1px solid rgba(255,255,255,0.08)',
            fontSize:    '18px',
            lineHeight:  1,
            color:       isOpen ? COLORS.violet : '#4A5E78',
            transition:  'background 150ms ease, border-color 150ms ease, color 150ms ease',
          }}
        >
          +
        </motion.span>
      </button>

      {/* Answer — animated open/close */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                padding:    '0 28px 24px',
                fontSize:   '14px',
                lineHeight: 1.70,
                color:      '#8895AB',
                maxWidth:   '680px',
              }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── FundingFAQ ─────────────────────────────────────────────────────────────

export function FundingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq" tinted ruled motion={{ delay: 0.05 }}>
      <div
        style={{
          display:  'flex',
          gap:      '80px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: heading (sticky on desktop) */}
        <div style={{ flex: '0 0 280px' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <SectionLabel color="muted" style={{ marginBottom: '16px' }}>FAQ</SectionLabel>
            <h2
              style={{
                fontSize:      '36px',
                fontWeight:    800,
                letterSpacing: '-0.025em',
                lineHeight:    1.05,
                color:         '#E8EDF8',
                marginBottom:  '16px',
              }}
            >
              Clear answers.{' '}
              <GradientText preset="violet">No fine print.</GradientText>
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#8895AB' }}>
              Every rule, every fee, every process — documented before you pay.
            </p>
          </div>
        </div>

        {/* Right: accordion */}
        <div style={{ flex: '1 1 400px' }}>
          <GlassCard variant="glass" style={{ overflow: 'hidden' }}>
            {FAQ_ITEMS.map((item, i) => (
              <FAQRow
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </GlassCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
