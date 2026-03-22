/**
 * Badge
 *
 * Multi-purpose badge / pill component covering:
 *   - Tier badges (Starter / Pro / Elite)
 *   - Status badges (Funded / Pending / Closed / Resolved)
 *   - Return/percentage pills (positive / negative / neutral)
 *   - Category pills (used in Prediction Markets filter row)
 *
 * Server component — zero JS.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { BadgeVariant, ReturnSentiment } from '@/lib/neon/types';

// ── Tier Badges ────────────────────────────────────────────────────────────

interface TierConfig {
  label: string;
  bg: string;
  border: string;
  color: string;
  shadow?: string;
}

const TIER_CONFIG: Record<'starter' | 'pro' | 'elite', TierConfig> = {
  starter: {
    label: 'STARTER',
    bg:     'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.10)',
    color:  '#8895AB',
  },
  pro: {
    label: 'POPULAR',
    bg:     'rgba(124,106,247,0.12)',
    border: 'rgba(124,106,247,0.40)',
    color:  '#BDB2FB',
    shadow: '0 0 20px rgba(124,106,247,0.20), 0 0 60px rgba(124,106,247,0.08)',
  },
  elite: {
    label: 'ELITE',
    bg:     'rgba(232,184,75,0.10)',
    border: 'rgba(232,184,75,0.35)',
    color:  '#E8B84B',
    shadow: '0 0 20px rgba(232,184,75,0.20), 0 0 60px rgba(232,184,75,0.08)',
  },
};

interface TierBadgeProps {
  tier: 'starter' | 'pro' | 'elite';
  className?: string;
  style?: CSSProperties;
}

export function TierBadge({ tier, className, style }: TierBadgeProps) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '9999px',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.10em',
        color: cfg.color,
        boxShadow: cfg.shadow,
        ...style,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ── Status Badges ──────────────────────────────────────────────────────────

interface StatusConfig {
  bg: string;
  border: string;
  color: string;
}

const STATUS_CONFIG: Record<Exclude<BadgeVariant, `tier-${string}`>, StatusConfig> = {
  funded:   { bg: 'rgba(0,232,135,0.08)',   border: 'rgba(0,232,135,0.20)',   color: '#00E887' },
  pending:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.20)',  color: '#F59E0B' },
  closed:   { bg: 'rgba(74,94,120,0.12)',   border: 'rgba(74,94,120,0.20)',   color: '#4A5E78' },
  resolved: { bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.20)',  color: '#22D3EE' },
  live:     { bg: 'rgba(0,232,135,0.10)',   border: 'rgba(0,232,135,0.30)',   color: '#00E887' },
};

const STATUS_LABELS: Record<Exclude<BadgeVariant, `tier-${string}`>, string> = {
  funded:   'FUNDED',
  pending:  'PENDING',
  closed:   'CLOSED',
  resolved: 'RESOLVED',
  live:     'LIVE',
};

interface StatusBadgeProps {
  status: Exclude<BadgeVariant, `tier-${string}`>;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function StatusBadge({ status, label, className, style }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const text = label ?? STATUS_LABELS[status];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '9999px',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: cfg.color,
        ...style,
      }}
    >
      {text}
    </span>
  );
}

// ── Return / Percentage Pill ───────────────────────────────────────────────

interface ReturnPillProps {
  value: string; // e.g. "+18.4%" or "-2.1%"
  sentiment?: ReturnSentiment;
  className?: string;
  style?: CSSProperties;
}

const RETURN_CONFIG: Record<ReturnSentiment, { bg: string; border: string; color: string }> = {
  positive: { bg: 'rgba(0,232,135,0.08)',  border: 'rgba(0,232,135,0.20)',  color: '#00E887' },
  negative: { bg: 'rgba(255,59,92,0.08)',  border: 'rgba(255,59,92,0.20)',  color: '#FF3B5C' },
  neutral:  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', color: '#8895AB' },
};

export function ReturnPill({ value, sentiment, className, style }: ReturnPillProps) {
  // Auto-detect sentiment from value string if not provided
  const resolved: ReturnSentiment =
    sentiment ??
    (value.startsWith('+')
      ? 'positive'
      : value.startsWith('-')
      ? 'negative'
      : 'neutral');

  const cfg = RETURN_CONFIG[resolved];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '6px',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '12px',
        fontWeight: 600,
        color: cfg.color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0',
        ...style,
      }}
    >
      {value}
    </span>
  );
}

// ── Category Pill ──────────────────────────────────────────────────────────
// Prediction Markets filter pills. Active state is handled by the parent
// via the `active` prop — this component stays server-renderable.

interface CategoryPillProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function CategoryPill({ children, active = false, className, style }: CategoryPillProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 18px',
        background:   active ? 'rgba(124,106,247,0.15)' : 'rgba(255,255,255,0.05)',
        border:       active ? '1px solid rgba(124,106,247,0.50)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '9999px',
        fontSize:     '13px',
        fontWeight:   active ? 600 : 400,
        color:        active ? '#E8EDF8' : '#8895AB',
        cursor:       'pointer',
        whiteSpace:   'nowrap',
        transition:   'all 150ms ease',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
