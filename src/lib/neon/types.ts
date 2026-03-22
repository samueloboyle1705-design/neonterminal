/**
 * Shared TypeScript types for the Neon Funded design system.
 * Import from '@/lib/neon/types'.
 */

/** Which marketing page we're on — drives color theme across shared components. */
export type NavVariant = 'funding' | 'markets';

/** Card surface style presets. */
export type CardVariant =
  | 'glass'          // Standard glass card (backdrop-blur, semi-transparent)
  | 'glass-elevated' // Featured glass card with gradient border + stronger glow
  | 'panel'          // Dense data panel (no backdrop-blur, used for tables/lists)
  | 'feature'        // Large landmark card (plan tiers, category heros)
  | 'chip';          // Small floating overlay chip

/** Primary button color theme. */
export type ButtonVariant =
  | 'primary'   // violet → cyan gradient (brand default)
  | 'warm'      // violet → gold (funding page primary action)
  | 'electric'  // cyan → orange (markets page primary action)
  | 'secondary' // transparent + border (ghost outlined)
  | 'ghost';    // text-only, no border

/** Button size scale. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Badge / status indicator variants. */
export type BadgeVariant =
  | 'funded'
  | 'pending'
  | 'closed'
  | 'resolved'
  | 'live'
  | 'tier-starter'
  | 'tier-pro'
  | 'tier-elite';

/** Return / percentage pill sentiment. */
export type ReturnSentiment = 'positive' | 'negative' | 'neutral';

/** Float animation delay index — maps to nf-float-{n} CSS class. */
export type FloatDelay = 0 | 1 | 2 | 3;

/** Gradient text presets matching the design system. */
export type GradientTextPreset =
  | 'hero'      // white → warm-grey (depth on large display text)
  | 'brand'     // white → violet → cyan
  | 'funding'   // white → gold → violet
  | 'markets'   // white → cyan → orange
  | 'yield'     // green-light → green (profit / funded)
  | 'violet'    // violet-300 → violet-500
  | 'custom';   // pass explicit from/via/to props

/** Glow divider color accent. */
export type DividerVariant = 'violet' | 'cyan' | 'green' | 'gold' | 'orange' | 'default';

/** SectionWrapper entrance animation trigger configuration. */
export interface SectionMotionConfig {
  /** Y offset to animate from (px). Default 24. */
  y?: number;
  /** Animation duration in seconds. Default 0.48. */
  duration?: number;
  /** Delay in seconds. Default 0. */
  delay?: number;
  /** IntersectionObserver root margin. Default '-80px'. */
  margin?: string;
}

/** A navigation link entry. */
export interface NavLinkDef {
  label: string;
  href: string;
}

/** A single stat displayed in a StatChip or stat row. */
export interface StatDef {
  label: string;
  value: string;
  /** CSS color string for the value text. */
  color?: string;
  /** Float delay index for animated chip variants. */
  floatDelay?: FloatDelay;
}
