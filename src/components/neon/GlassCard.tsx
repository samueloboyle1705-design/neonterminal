/**
 * GlassCard
 *
 * Glassmorphism card primitive. Five variants from the design system:
 *   glass          — standard floating card (backdrop-blur, semi-transparent)
 *   glass-elevated — featured card with gradient border + stronger glow
 *   panel          — dense data container (no backdrop-blur, lighter structure)
 *   feature        — large landmark card (plan tiers, category heroes)
 *   chip           — small floating overlay chip
 *
 * For the glass-elevated variant, a wrapper technique is used to achieve
 * a true gradient border without relying on `border-image` (which breaks
 * border-radius in most browsers).
 *
 * Server component — zero JS.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { CardVariant, NavVariant } from '@/lib/neon/types';
import { SHADOWS, GRADIENTS, COLORS } from '@/lib/neon/constants';

interface GlassCardProps {
  children: ReactNode;
  variant?: CardVariant;
  /**
   * Accent color for glow shadow + border highlight.
   * Accepts design-system color keys or explicit CSS values.
   */
  glow?: 'violet' | 'cyan' | 'green' | 'gold' | 'orange' | 'none';
  /**
   * Applies the gradient border technique on glass-elevated variant.
   * Automatically picks the right gradient based on `glowBorderVariant`.
   */
  glowBorderVariant?: NavVariant | 'brand';
  /** Stretch card to full height of its grid cell. */
  fullHeight?: boolean;
  className?: string;
  style?: CSSProperties;
  /** HTML element to render as. Default: 'div'. */
  as?: 'div' | 'article' | 'section' | 'aside';
}

const GLOW_SHADOWS_MAP: Record<string, string> = {
  violet: SHADOWS.glowVioletMd,
  cyan:   SHADOWS.glowCyanMd,
  green:  SHADOWS.glowGreenMd,
  gold:   SHADOWS.glowGoldMd,
  orange: SHADOWS.glowOrangeMd,
  none:   SHADOWS.liftLg,
};

const GRADIENT_BORDER_MAP: Record<string, string> = {
  funding: `linear-gradient(145deg, rgba(124,106,247,0.55) 0%, rgba(0,232,135,0.25) 50%, rgba(0,0,0,0) 100%)`,
  markets: `linear-gradient(145deg, rgba(34,211,238,0.55) 0%, rgba(249,115,22,0.25) 50%, rgba(0,0,0,0) 100%)`,
  brand:   `linear-gradient(145deg, rgba(124,106,247,0.55) 0%, rgba(34,211,238,0.25) 50%, rgba(0,0,0,0) 100%)`,
};

// ── Variant style definitions ──────────────────────────────────────────────

function getVariantStyles(
  variant: CardVariant,
  glow: string,
): CSSProperties {
  const glowShadow = GLOW_SHADOWS_MAP[glow] ?? SHADOWS.liftLg;

  switch (variant) {
    case 'glass':
      return {
        background:            'rgba(11,15,23,0.85)',
        backdropFilter:        'blur(24px) saturate(180%)',
        WebkitBackdropFilter:  'blur(24px) saturate(180%)',
        border:                '1px solid rgba(255,255,255,0.08)',
        borderRadius:          '20px',
        boxShadow:             glowShadow,
      };

    case 'glass-elevated':
      // The outer gradient border wrapper handles the border —
      // inner card has no explicit border.
      return {
        background:            'rgba(11,15,23,0.92)',
        backdropFilter:        'blur(32px) saturate(200%)',
        WebkitBackdropFilter:  'blur(32px) saturate(200%)',
        borderRadius:          '19px', // 1px smaller than outer wrapper's 20px
        boxShadow:             SHADOWS.glowVioletLg,
        position:              'relative',
      };

    case 'panel':
      return {
        background:   'rgba(12,18,32,0.60)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        boxShadow:    SHADOWS.liftSm,
      };

    case 'feature':
      return {
        background:            'rgba(11,15,23,0.90)',
        backdropFilter:        'blur(20px)',
        WebkitBackdropFilter:  'blur(20px)',
        border:                '1px solid rgba(255,255,255,0.09)',
        borderRadius:          '24px',
        boxShadow:             glowShadow,
      };

    case 'chip':
      return {
        background:            'rgba(8,13,24,0.96)',
        backdropFilter:        'blur(16px)',
        WebkitBackdropFilter:  'blur(16px)',
        border:                '1px solid rgba(255,255,255,0.10)',
        borderRadius:          '14px',
        boxShadow:             SHADOWS.liftMd,
      };
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  variant = 'glass',
  glow = 'none',
  glowBorderVariant,
  fullHeight = false,
  className,
  style,
  as: Tag = 'div',
}: GlassCardProps) {
  const variantStyles = getVariantStyles(variant, glow);

  // Glass-elevated uses a gradient border wrapper
  if (variant === 'glass-elevated') {
    const borderGradient =
      GRADIENT_BORDER_MAP[glowBorderVariant ?? 'brand'] ?? GRADIENT_BORDER_MAP.brand;

    return (
      // Outer wrapper carries the gradient as background + 1px padding = gradient border
      <div
        style={{
          padding: '1px',
          borderRadius: '20px',
          background: borderGradient,
          height: fullHeight ? '100%' : undefined,
        }}
      >
        <Tag
          className={className}
          style={{
            ...variantStyles,
            height: fullHeight ? '100%' : undefined,
            ...style,
          }}
        >
          {children}
        </Tag>
      </div>
    );
  }

  return (
    <Tag
      className={className}
      style={{
        ...variantStyles,
        height: fullHeight ? '100%' : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ── GlassCardBody ──────────────────────────────────────────────────────────
// Optional inner padding wrapper — keeps padding separate from border styles.

interface GlassCardBodyProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

const BODY_PADDING = { sm: '16px', md: '24px', lg: '32px' } as const;

export function GlassCardBody({ children, size = 'md', className, style }: GlassCardBodyProps) {
  return (
    <div
      className={className}
      style={{ padding: BODY_PADDING[size], ...style }}
    >
      {children}
    </div>
  );
}

// ── GlassSurface ──────────────────────────────────────────────────────────
// Applies the gradient-glass-surface overlay as a non-interactive layer.
// Render inside a card at the end of children — gives the glass shimmer.

export function GlassSurface() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: GRADIENTS.glassSurface,
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }}
    />
  );
}

// ── CardDivider ───────────────────────────────────────────────────────────
// Internal divider for use inside cards (table rows, sections).

export function CardDivider({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        height: '1px',
        background: 'rgba(255,255,255,0.05)',
        ...style,
      }}
    />
  );
}

// ── CardRow ───────────────────────────────────────────────────────────────
// Horizontal flex row inside a panel card (e.g. leaderboard rows).

interface CardRowProps {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function CardRow({ children, hoverable = true, className, style }: CardRowProps) {
  return (
    <div
      className={[hoverable ? 'group' : '', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 150ms ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
