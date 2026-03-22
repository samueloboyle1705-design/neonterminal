/**
 * /crypto-funding
 *
 * Elite crypto prop firm landing page.
 * All sections assembled here — CosmicBackground is fixed behind everything.
 */

import type { Metadata } from 'next';

import { CosmicBackground }  from '@/components/neon/CosmicBackground';
import { GlowDivider }       from '@/components/neon/GlowDivider';

import { FundingHero }       from '@/components/funding/FundingHero';
import { StatsStrip }        from '@/components/funding/StatsStrip';
import { KeyBenefits }       from '@/components/funding/KeyBenefits';
import { HowItWorks }        from '@/components/funding/HowItWorks';
import { PlanTiers }         from '@/components/funding/PlanTiers';
import { PlatformFeatures }  from '@/components/funding/PlatformFeatures';
import { WhyNeon }           from '@/components/funding/WhyNeon';
import { FundingFAQ }        from '@/components/funding/FundingFAQ';
import { FundingCTA }        from '@/components/funding/FundingCTA';

export const metadata: Metadata = {
  title: 'Funded Trading',
  description:
    'Trade up to $250,000 of firm capital. Prove your edge, respect the parameters, and keep up to 90% of every dollar you make. No personal capital at risk.',
  openGraph: {
    title:       'Neon Funded — Elite Crypto Prop Trading',
    description: 'Trade firm capital. Keep 90% of profits. No personal risk.',
    type:        'website',
  },
};

export default function CryptoFundingPage() {
  return (
    <>
      {/* Fixed cosmic atmosphere — funding palette */}
      <CosmicBackground variant="funding" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <FundingHero />

      {/* ── Trust / Stats strip ──────────────────────────────────────── */}
      <StatsStrip />

      {/* ── Key benefits ─────────────────────────────────────────────── */}
      <KeyBenefits />

      <GlowDivider variant="violet" bloom style={{ position: 'relative', zIndex: 1 }} />

      {/* ── How it works ─────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Challenge / Program options ──────────────────────────────── */}
      <PlanTiers />

      <GlowDivider variant="gold" bloom style={{ position: 'relative', zIndex: 1 }} />

      {/* ── Platform / Features ──────────────────────────────────────── */}
      <PlatformFeatures />

      {/* ── Why Neon ─────────────────────────────────────────────────── */}
      <WhyNeon />

      <GlowDivider variant="violet" bloom style={{ position: 'relative', zIndex: 1 }} />

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <FundingFAQ />

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <FundingCTA />
    </>
  );
}
