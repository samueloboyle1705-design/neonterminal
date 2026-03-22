/**
 * CosmicBackground
 *
 * Fixed-position multi-layer background that stays behind all page content
 * while content scrolls over it. Renders:
 *   - Base void color
 *   - 3–4 radial gradient atmosphere layers (color differs per page)
 *   - Subtle perspective grid overlay (fades out toward bottom)
 *   - 1px aurora gradient line at the very top of the viewport
 *
 * Server component — no JS, no hydration cost.
 */

import type { NavVariant } from '@/lib/neon/types';
import { GRADIENTS } from '@/lib/neon/constants';

interface CosmicBackgroundProps {
  variant?: NavVariant;
}

export function CosmicBackground({ variant = 'funding' }: CosmicBackgroundProps) {
  const layers = variant === 'funding' ? GRADIENTS.fundingBg : GRADIENTS.marketsBg;
  const aurora = variant === 'funding' ? GRADIENTS.auroraViolet : GRADIENTS.auroraCyan;
  const gridOpacity = variant === 'funding' ? 0.025 : 0.032;
  const gridSize   = variant === 'funding' ? '80px 80px' : '40px 40px';

  // Compose all atmosphere radials + base color into one background string
  const atmosphereBackground = [...layers, '#02040A'].join(', ');

  return (
    <>
      {/* ── Aurora line — top edge of viewport ───────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: aurora,
          zIndex: 60, // above nav so it bleeds through
          pointerEvents: 'none',
        }}
      />

      {/* ── Atmosphere + grid ─────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Atmosphere radials */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: atmosphereBackground,
          }}
        />

        {/* Grid overlay — fades out downward */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,${gridOpacity}) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px)
            `,
            backgroundSize: gridSize,
            maskImage:
              'radial-gradient(ellipse 110% 60% at 50% 0%, black 20%, transparent 85%)',
          }}
        />

        {/* Subtle vignette — darkens the very edges for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 50%, rgba(2,4,10,0.6) 100%)',
          }}
        />
      </div>
    </>
  );
}
