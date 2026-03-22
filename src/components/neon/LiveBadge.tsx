/**
 * LiveBadge
 *
 * Animated "LIVE" indicator with a pulsing ring.
 * Pure CSS animation — no JS required.
 *
 * Server component — zero JS.
 */

import type { CSSProperties } from 'react';

type LiveBadgeSize = 'sm' | 'md' | 'lg';

interface LiveBadgeProps {
  size?: LiveBadgeSize;
  label?: string;
  /** Override accent color. Defaults to green. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const SIZE_CONFIG = {
  sm: { padding: '3px 10px', fontSize: '10px', dotSize: '5px', gap: '5px' },
  md: { padding: '4px 12px', fontSize: '11px', dotSize: '6px', gap: '6px' },
  lg: { padding: '6px 16px', fontSize: '13px', dotSize: '8px', gap: '8px' },
} as const;

export function LiveBadge({
  size = 'md',
  label = 'LIVE',
  color = '#00E887',
  className,
  style,
}: LiveBadgeProps) {
  const cfg = SIZE_CONFIG[size];

  // rgba versions from color — we use these for bg/border
  // Since color is hex, construct rgba approximations inline per design tokens.
  // For non-standard colors, callers should pass their own color.
  const isGreen  = color === '#00E887' || color === '#00e887';
  const isCyan   = color === '#22D3EE' || color === '#22d3ee';
  const isOrange = color === '#F97316' || color === '#f97316';

  const bgColor     = isGreen  ? 'rgba(0,232,135,0.10)'
                    : isCyan   ? 'rgba(34,211,238,0.10)'
                    : isOrange ? 'rgba(249,115,22,0.10)'
                    : 'rgba(255,255,255,0.06)';
  const borderColor = isGreen  ? 'rgba(0,232,135,0.30)'
                    : isCyan   ? 'rgba(34,211,238,0.30)'
                    : isOrange ? 'rgba(249,115,22,0.30)'
                    : 'rgba(255,255,255,0.12)';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: cfg.gap,
        padding: cfg.padding,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '9999px',
        ...style,
      }}
    >
      {/* Dot + pulse ring wrapper */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: cfg.dotSize,
          height: cfg.dotSize,
          flexShrink: 0,
        }}
      >
        {/* Pulse ring */}
        <span
          className="nf-pulse-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            opacity: 0,
          }}
        />
        {/* Solid dot */}
        <span
          style={{
            width: cfg.dotSize,
            height: cfg.dotSize,
            borderRadius: '50%',
            background: color,
            display: 'block',
          }}
        />
      </span>

      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: cfg.fontSize,
          fontWeight: 600,
          letterSpacing: '0.10em',
          color,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}
