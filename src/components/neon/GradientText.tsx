/**
 * GradientText
 *
 * Inline span that renders text with a CSS gradient fill.
 * Use preset names from the design system or pass custom from/via/to values.
 *
 * Server component — zero JS.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { GradientTextPreset } from '@/lib/neon/types';
import { GRADIENTS } from '@/lib/neon/constants';

const PRESET_MAP: Record<Exclude<GradientTextPreset, 'custom'>, string> = {
  hero:     GRADIENTS.textHero,
  brand:    GRADIENTS.textBrand,
  funding:  GRADIENTS.textFunding,
  markets:  GRADIENTS.textMarkets,
  yield:    GRADIENTS.textYield,
  violet:   GRADIENTS.textViolet,
};

interface GradientTextProps {
  children: ReactNode;
  /** Named design-system preset. Ignored when `from` is provided. */
  preset?: GradientTextPreset;
  /** Custom start color (CSS color value). */
  from?: string;
  /** Custom mid-point color (optional). */
  via?: string;
  /** Custom end color. */
  to?: string;
  /** Extra class names applied to the span. */
  className?: string;
  /** Extra inline styles. */
  style?: CSSProperties;
  /** HTML element to render. Default: 'span'. */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

export function GradientText({
  children,
  preset = 'brand',
  from,
  via,
  to,
  className,
  style,
  as: Tag = 'span',
}: GradientTextProps) {
  let gradient: string;

  if (from && to) {
    gradient = via
      ? `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`
      : `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
  } else {
    gradient = PRESET_MAP[preset as Exclude<GradientTextPreset, 'custom'>] ?? GRADIENTS.textBrand;
  }

  const gradientStyle: CSSProperties = {
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline',
    ...style,
  };

  return (
    <Tag className={className} style={gradientStyle}>
      {children}
    </Tag>
  );
}
