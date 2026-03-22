/**
 * StatChip
 *
 * Floating metric chip — glassmorphism card showing a label and large value.
 * Used as overlay elements on hero sections.
 *
 * Two usage modes:
 *   1. Static — renders as a server component, positioned by the parent.
 *   2. Floating — adds a CSS float animation via nf-float-{delay} class.
 *
 * Server component — CSS-only animation, zero JS.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { FloatDelay } from '@/lib/neon/types';
import { SHADOWS } from '@/lib/neon/constants';

interface StatChipProps {
  label: string;
  value: ReactNode;
  /** CSS color for the value text. */
  valueColor?: string;
  /** Adds the nf-float-{n} animation class. Omit for static chips. */
  floatDelay?: FloatDelay;
  /** Accent color for the border/glow (as hex or rgba string). */
  accentColor?: string;
  /** Pre-defined glow shadow key — uses design system shadows. */
  glow?: 'violet' | 'green' | 'gold' | 'cyan' | 'orange' | 'none';
  /** Icon or decorative element rendered before label. */
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const GLOW_SHADOWS: Record<string, string> = {
  violet: SHADOWS.glowVioletSm,
  green:  '0 0 20px rgba(0,232,135,0.20), 0 0 60px rgba(0,232,135,0.08)',
  gold:   '0 0 20px rgba(232,184,75,0.22), 0 0 60px rgba(232,184,75,0.08)',
  cyan:   '0 0 20px rgba(34,211,238,0.20), 0 0 60px rgba(34,211,238,0.08)',
  orange: '0 0 20px rgba(249,115,22,0.22), 0 0 60px rgba(249,115,22,0.08)',
  none:   '',
};

const ACCENT_BORDERS: Record<string, string> = {
  violet: 'rgba(124,106,247,0.30)',
  green:  'rgba(0,232,135,0.30)',
  gold:   'rgba(232,184,75,0.30)',
  cyan:   'rgba(34,211,238,0.30)',
  orange: 'rgba(249,115,22,0.30)',
  none:   'rgba(255,255,255,0.09)',
};

export function StatChip({
  label,
  value,
  valueColor,
  floatDelay,
  accentColor,
  glow = 'none',
  icon,
  className,
  style,
}: StatChipProps) {
  const floatClass = floatDelay !== undefined ? `nf-float-${floatDelay}` : '';
  const borderColor = accentColor ?? ACCENT_BORDERS[glow] ?? 'rgba(255,255,255,0.09)';
  const shadowValue = [SHADOWS.liftMd, GLOW_SHADOWS[glow]].filter(Boolean).join(', ');

  return (
    <div
      className={[floatClass, className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '12px 16px',
        minWidth: '80px',
        background: 'rgba(8,13,24,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        boxShadow: shadowValue,
        ...style,
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: icon ? '6px' : 0,
        }}
      >
        {icon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#4A5E78',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: valueColor ?? '#E8EDF8',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── StatChipRow ────────────────────────────────────────────────────────────
// Non-floating inline stat row used in mobile hero (replaces floating chips).

interface StatChipRowProps {
  stats: Array<{ label: string; value: string; color?: string }>;
  className?: string;
  style?: CSSProperties;
}

export function StatChipRow({ stats, className, style }: StatChipRowProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4A5E78',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: color ?? '#E8EDF8',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
