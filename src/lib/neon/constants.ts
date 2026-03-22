/**
 * Neon Funded design system — shared constants.
 *
 * All gradient strings, shadow compositions, color values, and routing
 * constants live here. Components reference these rather than inventing
 * ad-hoc values inline.
 *
 * Import from '@/lib/neon/constants'.
 */

import type { NavLinkDef } from './types';

// ── Routes ────────────────────────────────────────────────────────────────

export const ROUTES = {
  terminal:         '/terminal',
  cryptoFunding:    '/crypto-funding',
  predictionMarkets: '/prediction-markets',
} as const;

// ── Navigation ────────────────────────────────────────────────────────────

export const NAV_LINKS: NavLinkDef[] = [
  { label: 'Platform',           href: ROUTES.terminal },
  { label: 'Funded Trading',     href: ROUTES.cryptoFunding },
  { label: 'Prediction Markets', href: ROUTES.predictionMarkets },
];

// ── Color values (raw hex / rgba) ─────────────────────────────────────────
// These mirror the CSS @theme tokens so TypeScript components can reference
// them for inline styles (e.g. boxShadow compositions) where Tailwind classes
// can't express complex multi-layer values.

export const COLORS = {
  // Void scale
  void:        '#02040A',
  void800:     '#080D18',
  void700:     '#0C1220',

  // Terminal palette (re-exported for cross-use)
  bg:          '#080B10',
  panel:       '#0B0F17',
  surface:     '#0F1520',
  overlay:     '#152030',

  // Brand
  violet:      '#7C6AF7',
  violetLight: '#BDB2FB',
  violetDeep:  '#1A1245',
  cyan:        '#22D3EE',
  cyanLight:   '#A5F3FC',
  green:       '#00E887',
  greenLight:  '#A3F7D0',
  red:         '#FF3B5C',
  amber:       '#F59E0B',
  gold:        '#E8B84B',
  goldDim:     '#1C1000',
  orange:      '#F97316',
  orangeDim:   '#1A0800',

  // Text
  textPrimary:   '#E8EDF8',
  textSecondary: '#8895AB',
  textTertiary:  '#4A5E78',
  textDisabled:  '#2A3A50',

  // Borders (rgba)
  borderSubtle:    'rgba(255,255,255,0.04)',
  borderDefault:   'rgba(255,255,255,0.07)',
  borderModerate:  'rgba(255,255,255,0.12)',
  borderHighlight: 'rgba(124,106,247,0.25)',
  borderActive:    'rgba(124,106,247,0.55)',
} as const;

// ── Gradients ─────────────────────────────────────────────────────────────

export const GRADIENTS = {
  // Brand CTAs
  brandPrimary:  'linear-gradient(135deg, #7C6AF7 0%, #22D3EE 100%)',
  brandWarm:     'linear-gradient(135deg, #7C6AF7 0%, #E8B84B 100%)',
  brandElectric: 'linear-gradient(135deg, #22D3EE 0%, #F97316 100%)',
  brandYield:    'linear-gradient(135deg, #7C6AF7 0%, #00E887 100%)',

  // Text gradients (used with background-clip: text)
  textHero:     'linear-gradient(180deg, #E8EDF8 0%, #8895AB 100%)',
  textBrand:    'linear-gradient(135deg, #E8EDF8 0%, #7C6AF7 50%, #22D3EE 100%)',
  textFunding:  'linear-gradient(135deg, #E8EDF8 0%, #E8B84B 60%, #7C6AF7 100%)',
  textMarkets:  'linear-gradient(135deg, #E8EDF8 0%, #22D3EE 50%, #F97316 100%)',
  textYield:    'linear-gradient(135deg, #34EFA0 0%, #00E887 100%)',
  textViolet:   'linear-gradient(135deg, #BDB2FB 0%, #7C6AF7 100%)',

  // Card surface overlay (gradient-glass-surface — applied as an overlay on glass cards)
  glassSurface:
    'linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 50%, rgba(0,0,0,0.10) 100%)',

  // Card tinted variants
  cardViolet:  'linear-gradient(145deg, rgba(124,106,247,0.08) 0%, rgba(124,106,247,0.02) 100%)',
  cardYield:   'linear-gradient(145deg, rgba(0,232,135,0.07)   0%, rgba(0,232,135,0.02)   100%)',
  cardTension: 'linear-gradient(145deg, rgba(249,115,22,0.08)  0%, rgba(249,115,22,0.02)  100%)',
  cardGold:    'linear-gradient(145deg, rgba(232,184,75,0.08)  0%, rgba(232,184,75,0.02)  100%)',

  // Aurora top lines
  auroraViolet:
    'linear-gradient(90deg, transparent 0%, rgba(124,106,247,0.7) 25%, rgba(0,232,135,0.4) 60%, transparent 100%)',
  auroraCyan:
    'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.6) 30%, rgba(249,115,22,0.5) 65%, transparent 100%)',

  // Background atmosphere — Funding page (compose all layers in CosmicBackground)
  fundingBg: [
    'radial-gradient(ellipse 80% 60% at 92% 4%, rgba(124,106,247,0.20) 0%, rgba(124,106,247,0.06) 40%, transparent 65%)',
    'radial-gradient(ellipse 65% 80% at 4% 96%, rgba(0,232,135,0.10) 0%, rgba(0,232,135,0.03) 45%, transparent 65%)',
    'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(59,158,255,0.04) 0%, transparent 70%)',
    'radial-gradient(ellipse 40% 30% at 75% 80%, rgba(232,184,75,0.06) 0%, transparent 60%)',
  ],

  // Background atmosphere — Markets page
  marketsBg: [
    'radial-gradient(ellipse 70% 55% at 8% 35%, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0.04) 45%, transparent 65%)',
    'radial-gradient(ellipse 55% 50% at 95% 10%, rgba(249,115,22,0.12) 0%, rgba(255,59,92,0.06) 40%, transparent 65%)',
    'radial-gradient(ellipse 35% 60% at 88% 60%, rgba(255,59,92,0.07) 0%, transparent 60%)',
  ],
} as const;

// ── Shadow compositions ────────────────────────────────────────────────────
// Multi-layer box-shadow values.

export const SHADOWS = {
  // Elevation (no color)
  liftSm: '0 4px 16px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.04)',
  liftMd: '0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.05)',
  liftLg: '0 24px 64px rgba(0,0,0,0.60), 0 8px 24px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.05)',
  liftXl: '0 40px 100px rgba(0,0,0,0.70), 0 16px 40px rgba(0,0,0,0.80), inset 0 1px 0 rgba(255,255,255,0.06)',

  // Brand glow (colored)
  glowVioletSm: '0 0 20px rgba(124,106,247,0.20), 0 0 60px rgba(124,106,247,0.08)',
  glowVioletMd:
    '0 8px 32px rgba(0,0,0,0.50), 0 0 40px rgba(124,106,247,0.25), 0 0 100px rgba(124,106,247,0.10), inset 0 1px 0 rgba(255,255,255,0.06)',
  glowVioletLg:
    '0 24px 80px rgba(0,0,0,0.60), 0 0 60px rgba(124,106,247,0.30), 0 0 120px rgba(124,106,247,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',

  glowCyanMd:
    '0 8px 32px rgba(0,0,0,0.50), 0 0 40px rgba(34,211,238,0.20), 0 0 100px rgba(34,211,238,0.08)',
  glowGreenMd:
    '0 8px 32px rgba(0,0,0,0.50), 0 0 40px rgba(0,232,135,0.20), 0 0 100px rgba(0,232,135,0.08)',
  glowGoldMd:
    '0 8px 32px rgba(0,0,0,0.50), 0 0 40px rgba(232,184,75,0.22), 0 0 100px rgba(232,184,75,0.08)',
  glowOrangeMd:
    '0 8px 32px rgba(0,0,0,0.50), 0 0 40px rgba(249,115,22,0.22), 0 0 100px rgba(249,115,22,0.08)',

  // Buttons
  btnViolet:
    '0 4px 20px rgba(124,106,247,0.45), 0 1px 4px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.15)',
  btnVioletHover:
    '0 8px 32px rgba(124,106,247,0.60), 0 2px 8px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.20)',
  btnGreen:
    '0 4px 20px rgba(0,232,135,0.40), 0 1px 4px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.12)',
  btnGold:
    '0 4px 20px rgba(232,184,75,0.40), 0 1px 4px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.12)',
  btnOrange:
    '0 4px 20px rgba(249,115,22,0.40), 0 1px 4px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.12)',
} as const;

// ── Border radius ─────────────────────────────────────────────────────────

export const RADIUS = {
  sm:   '6px',
  md:   '10px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'28px',
  full: '9999px',
} as const;

// ── Typography — font sizes and tracking ──────────────────────────────────
// Used when inline styles are required (e.g. complex gradient text spans).

export const TYPE = {
  display2xl: { fontSize: '96px', lineHeight: 0.90, letterSpacing: '-0.05em', fontWeight: 900 },
  displayXl:  { fontSize: '80px', lineHeight: 0.92, letterSpacing: '-0.045em', fontWeight: 900 },
  displayLg:  { fontSize: '64px', lineHeight: 0.94, letterSpacing: '-0.04em', fontWeight: 900 },
  displayMd:  { fontSize: '48px', lineHeight: 0.96, letterSpacing: '-0.03em', fontWeight: 800 },
  displaySm:  { fontSize: '40px', lineHeight: 1.00, letterSpacing: '-0.025em', fontWeight: 800 },
  headingXl:  { fontSize: '32px', lineHeight: 1.10, letterSpacing: '-0.02em', fontWeight: 700 },
  headingLg:  { fontSize: '26px', lineHeight: 1.15, letterSpacing: '-0.015em', fontWeight: 700 },
  headingMd:  { fontSize: '22px', lineHeight: 1.20, letterSpacing: '-0.01em', fontWeight: 600 },
  headingSm:  { fontSize: '18px', lineHeight: 1.25, letterSpacing: '-0.008em', fontWeight: 600 },
  labelLg:    { fontSize: '13px', letterSpacing: '0.12em', fontWeight: 600 },
  labelMd:    { fontSize: '12px', letterSpacing: '0.10em', fontWeight: 600 },
  labelSm:    { fontSize: '11px', letterSpacing: '0.08em', fontWeight: 600 },
  labelXs:    { fontSize: '10px', letterSpacing: '0.08em', fontWeight: 500 },
  data2xl:    { fontSize: '48px', letterSpacing: '-0.03em', fontWeight: 800 },
  dataXl:     { fontSize: '36px', letterSpacing: '-0.025em', fontWeight: 800 },
  dataLg:     { fontSize: '28px', letterSpacing: '-0.02em', fontWeight: 700 },
  dataMd:     { fontSize: '22px', letterSpacing: '-0.015em', fontWeight: 700 },
  dataSm:     { fontSize: '18px', letterSpacing: '-0.01em', fontWeight: 700 },
  dataXs:     { fontSize: '14px', letterSpacing: '0', fontWeight: 600 },
  data2xs:    { fontSize: '12px', letterSpacing: '0.02em', fontWeight: 500 },
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────

export const SPACE = {
  sectionV:   '120px',   // Vertical section padding (desktop)
  sectionVMd: '80px',    // Vertical section padding (tablet)
  sectionVSm: '64px',    // Vertical section padding (mobile)
  sectionH:   '32px',    // Horizontal section padding
  maxWidth:   '1280px',  // Content max-width
  maxNarrow:  '800px',   // Narrow content max-width (centered text sections)
} as const;
