/**
 * SectionWrapper
 *
 * Standard section container with:
 *   - Framer Motion fade-up entrance on scroll into view
 *   - Consistent max-width + horizontal padding
 *   - Vertical section spacing
 *   - Optional tinted background panel
 *
 * Client component — uses Framer Motion useInView.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { SectionMotionConfig } from '@/lib/neon/types';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SPACE } from '@/lib/neon/constants';

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  /** Removes max-width constraint — content spans full width. */
  fullWidth?: boolean;
  /** Removes inner max-width from content (useful for full-bleed CTA). */
  bleed?: boolean;
  /**
   * Tinted background panel behind the section.
   * Uses a dark semi-transparent surface.
   */
  tinted?: boolean;
  /** Top/bottom border lines on the tinted panel. */
  ruled?: boolean;
  motion?: SectionMotionConfig;
  className?: string;
  style?: CSSProperties;
  innerClassName?: string;
  innerStyle?: CSSProperties;
}

export function SectionWrapper({
  children,
  id,
  fullWidth = false,
  bleed = false,
  tinted = false,
  ruled = false,
  motion: motionConfig = {},
  className,
  style,
  innerClassName,
  innerStyle,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: (motionConfig.margin ?? '-80px') as `${number}px`,
  });

  const {
    y        = 24,
    duration = 0.48,
    delay    = 0,
  } = motionConfig;

  const sectionStyle: CSSProperties = {
    position: 'relative',
    zIndex:   1,
    ...(tinted
      ? {
          background:  'rgba(8,13,24,0.55)',
          borderTop:   ruled ? '1px solid rgba(255,255,255,0.06)' : undefined,
          borderBottom:ruled ? '1px solid rgba(255,255,255,0.06)' : undefined,
        }
      : {}),
    ...style,
  };

  const paddingStyle: CSSProperties = bleed
    ? {}
    : {
        paddingTop:    SPACE.sectionV,
        paddingBottom: SPACE.sectionV,
        paddingLeft:   SPACE.sectionH,
        paddingRight:  SPACE.sectionH,
      };

  const innerMaxWidth: CSSProperties = fullWidth
    ? {}
    : { maxWidth: SPACE.maxWidth, margin: '0 auto' };

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={sectionStyle}
      className={className}
    >
      <div
        style={{ ...paddingStyle, ...innerMaxWidth, ...innerStyle }}
        className={innerClassName}
      >
        {children}
      </div>
    </motion.section>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────
// Standardised heading block used at the top of most sections.

interface SectionHeaderProps {
  /** Small label rendered above the heading. */
  label?: ReactNode;
  heading: ReactNode;
  /** Body paragraph beneath the heading. */
  body?: ReactNode;
  /** Horizontal alignment. Default: 'left'. */
  align?: 'left' | 'center';
  /** Constrain body text width for readability. */
  narrowBody?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SectionHeader({
  label,
  heading,
  body,
  align = 'left',
  narrowBody = true,
  className,
  style,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={className}
      style={{
        display:    'flex',
        flexDirection: 'column',
        gap:        '16px',
        textAlign:  isCenter ? 'center' : 'left',
        alignItems: isCenter ? 'center' : 'flex-start',
        ...style,
      }}
    >
      {label && <div>{label}</div>}

      <div
        style={{
          fontSize:     'clamp(32px, 5vw, 48px)',
          fontWeight:   800,
          lineHeight:   1.05,
          letterSpacing:'-0.025em',
          color:        '#E8EDF8',
        }}
      >
        {heading}
      </div>

      {body && (
        <p
          style={{
            fontSize:  '17px',
            lineHeight: 1.70,
            color:     '#8895AB',
            maxWidth:  narrowBody ? '560px' : undefined,
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
