/**
 * SectionLabel
 *
 * Small uppercase tracked label that sits above section headings.
 * Optionally prefixed with a colored dot or line accent.
 *
 * Server component — zero JS.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { NavVariant } from '@/lib/neon/types';
import { COLORS } from '@/lib/neon/constants';

type LabelColor = 'violet' | 'cyan' | 'green' | 'gold' | 'orange' | 'muted';

const COLOR_MAP: Record<LabelColor, string> = {
  violet: COLORS.violet,
  cyan:   COLORS.cyan,
  green:  COLORS.green,
  gold:   COLORS.gold,
  orange: COLORS.orange,
  muted:  COLORS.textTertiary,
};

interface SectionLabelProps {
  children: ReactNode;
  /** Accent color. Pass 'variant' to auto-select based on page. */
  color?: LabelColor | 'variant';
  /** Page variant — used only when color='variant'. */
  variant?: NavVariant;
  /** Show a small colored dot prefix. Default: true. */
  dot?: boolean;
  /** Extra class names. */
  className?: string;
  style?: CSSProperties;
}

export function SectionLabel({
  children,
  color = 'muted',
  variant,
  dot = true,
  className,
  style,
}: SectionLabelProps) {
  const resolvedColor =
    color === 'variant'
      ? COLOR_MAP[variant === 'markets' ? 'cyan' : 'violet']
      : COLOR_MAP[color];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: resolvedColor,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: resolvedColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </div>
  );
}
