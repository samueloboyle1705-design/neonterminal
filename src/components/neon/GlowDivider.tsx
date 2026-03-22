/**
 * GlowDivider
 *
 * A 1px horizontal rule with a centered gradient glow.
 * Optional bloom creates a larger, soft halo beneath the line.
 *
 * Server component — zero JS.
 */

import type { CSSProperties } from 'react';
import type { DividerVariant } from '@/lib/neon/types';

const GLOW_MAP: Record<DividerVariant, { line: string; bloom: string }> = {
  violet: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(124,106,247,0.8) 30%, rgba(34,211,238,0.5) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(124,106,247,0.15) 0%, transparent 70%)',
  },
  cyan: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.8) 30%, rgba(249,115,22,0.5) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(34,211,238,0.12) 0%, transparent 70%)',
  },
  green: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(0,232,135,0.7) 35%, rgba(0,232,135,0.3) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,232,135,0.10) 0%, transparent 70%)',
  },
  gold: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(232,184,75,0.7) 35%, rgba(124,106,247,0.4) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(232,184,75,0.10) 0%, transparent 70%)',
  },
  orange: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.7) 35%, rgba(255,59,92,0.4) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(249,115,22,0.10) 0%, transparent 70%)',
  },
  default: {
    line:  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.08) 65%, transparent 100%)',
    bloom: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
  },
};

interface GlowDividerProps {
  variant?: DividerVariant;
  /** Show the soft bloom halo beneath the line. Default: true. */
  bloom?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GlowDivider({
  variant = 'violet',
  bloom = true,
  className,
  style,
}: GlowDividerProps) {
  const { line, bloom: bloomGradient } = GLOW_MAP[variant];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: bloom ? '40px' : '1px',
        ...style,
      }}
    >
      {/* The 1px line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: line,
        }}
      />
      {/* Bloom halo */}
      {bloom && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: bloomGradient,
          }}
        />
      )}
    </div>
  );
}
