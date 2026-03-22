/**
 * Button
 *
 * Full design-system button component with all variants and sizes.
 * Uses Framer Motion for premium hover/tap feedback.
 *
 * Renders as <button> or <a> (when `href` is provided).
 *
 * Client component — uses Framer Motion.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { ButtonVariant, ButtonSize } from '@/lib/neon/types';
import { GRADIENTS, SHADOWS } from '@/lib/neon/constants';
import { motion, type HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

// ── Style maps ────────────────────────────────────────────────────────────

interface VariantConfig {
  background: string;
  color: string;
  border: string;
  shadow: string;
  hoverShadow: string;
}

const VARIANT_CONFIG: Record<ButtonVariant, VariantConfig> = {
  primary: {
    background:  GRADIENTS.brandPrimary,
    color:       '#FFFFFF',
    border:      'none',
    shadow:      SHADOWS.btnViolet,
    hoverShadow: SHADOWS.btnVioletHover,
  },
  warm: {
    background:  GRADIENTS.brandWarm,
    color:       '#FFFFFF',
    border:      'none',
    shadow:      SHADOWS.btnGold,
    hoverShadow: '0 8px 32px rgba(232,184,75,0.55), 0 2px 8px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.20)',
  },
  electric: {
    background:  GRADIENTS.brandElectric,
    color:       '#FFFFFF',
    border:      'none',
    shadow:      SHADOWS.btnOrange,
    hoverShadow: '0 8px 32px rgba(249,115,22,0.55), 0 2px 8px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.20)',
  },
  secondary: {
    background:  'transparent',
    color:       '#8895AB',
    border:      '1px solid rgba(255,255,255,0.10)',
    shadow:      'none',
    hoverShadow: 'none',
  },
  ghost: {
    background:  'transparent',
    color:       '#8895AB',
    border:      'none',
    shadow:      'none',
    hoverShadow: 'none',
  },
};

interface SizeConfig {
  padding: string;
  fontSize: string;
  borderRadius: string;
  minHeight: string;
}

const SIZE_CONFIG: Record<ButtonSize, SizeConfig> = {
  sm: { padding: '8px 14px',  fontSize: '13px', borderRadius: '8px',  minHeight: '34px' },
  md: { padding: '12px 24px', fontSize: '14px', borderRadius: '10px', minHeight: '42px' },
  lg: { padding: '16px 32px', fontSize: '15px', borderRadius: '10px', minHeight: '52px' },
};

// ── Component ─────────────────────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders as a Next.js Link wrapping a motion button. */
  href?: string;
  onClick?: () => void;
  /** Stretches to full container width. */
  fullWidth?: boolean;
  /** Disable state — reduces opacity, no interaction. */
  disabled?: boolean;
  /** HTML type attribute (only for <button> render). */
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
  /** Trailing icon / element (e.g. arrow). */
  trailingIcon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className,
  style,
  trailingIcon,
}: ButtonProps) {
  const vc = VARIANT_CONFIG[variant];
  const sc = SIZE_CONFIG[size];

  const baseStyle: CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '8px',
    background:     vc.background,
    color:          vc.color,
    border:         vc.border,
    borderRadius:   sc.borderRadius,
    padding:        sc.padding,
    fontSize:       sc.fontSize,
    fontWeight:     variant === 'ghost' ? 500 : 700,
    letterSpacing:  '0.01em',
    minHeight:      sc.minHeight,
    width:          fullWidth ? '100%' : undefined,
    boxShadow:      vc.shadow,
    cursor:         disabled ? 'not-allowed' : 'pointer',
    opacity:        disabled ? 0.5 : 1,
    textDecoration: 'none',
    lineHeight:     1,
    whiteSpace:     'nowrap',
    userSelect:     'none',
    outline:        'none',
    ...style,
  };

  // Hover / tap styles for secondary and ghost (no shadow shift)
  const isColoredVariant = !['secondary', 'ghost'].includes(variant);

  const motionProps: HTMLMotionProps<'button'> = {
    whileHover: disabled
      ? {}
      : {
          scale:     1.02,
          boxShadow: isColoredVariant ? vc.hoverShadow : undefined,
          backgroundColor: variant === 'secondary'
            ? 'rgba(255,255,255,0.03)'
            : variant === 'ghost'
            ? 'rgba(255,255,255,0.02)'
            : undefined,
          borderColor: variant === 'secondary'
            ? 'rgba(255,255,255,0.20)'
            : undefined,
          color: ['secondary', 'ghost'].includes(variant) ? '#E8EDF8' : undefined,
        },
    whileTap: disabled ? {} : { scale: 0.99 },
    transition: {
      type:     'spring',
      stiffness: 400,
      damping:   25,
    },
  };

  const inner = (
    <>
      <span>{children}</span>
      {trailingIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {trailingIcon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }} tabIndex={-1}>
        <motion.button
          type="button"
          disabled={disabled}
          style={baseStyle}
          className={className}
          {...motionProps}
        >
          {inner}
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={baseStyle}
      className={className}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}

// ── IconButton ────────────────────────────────────────────────────────────

interface IconButtonProps {
  children: ReactNode;
  label: string; // aria-label
  onClick?: () => void;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function IconButton({ children, label, onClick, active = false, className, style }: IconButtonProps) {
  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.09)' }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '36px',
        height:         '36px',
        background:     active ? 'rgba(124,106,247,0.15)' : 'rgba(255,255,255,0.05)',
        border:         active ? '1px solid rgba(124,106,247,0.40)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius:   '8px',
        color:          active ? '#BDB2FB' : '#8895AB',
        cursor:         'pointer',
        outline:        'none',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
