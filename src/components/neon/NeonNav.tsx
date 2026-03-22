/**
 * NeonNav
 *
 * Shared marketing navigation bar. Sticky, with:
 *   - Scroll-aware backdrop blur (transparent → frosted on scroll)
 *   - Aurora gradient top line
 *   - Active link detection via usePathname
 *   - Auto-resolves variant (funding | markets) from pathname
 *   - Mobile hamburger menu with Framer Motion AnimatePresence
 *   - Responsive: desktop links hidden below lg, replaced by hamburger
 *
 * Client component — scroll detection + mobile state + usePathname.
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, ROUTES, GRADIENTS, COLORS } from '@/lib/neon/constants';
import type { NavVariant } from '@/lib/neon/types';

// ── Variant-driven config ─────────────────────────────────────────────────

interface VariantConfig {
  activeColor:  string;
  ctaGradient:  string;
  ctaShadow:    string;
  ctaLabel:     string;
  ctaHref:      string;
  aurora:       string;
}

const VARIANT_CONFIG: Record<NavVariant, VariantConfig> = {
  funding: {
    activeColor: COLORS.green,
    ctaGradient: GRADIENTS.brandWarm,
    ctaShadow:   '0 4px 20px rgba(232,184,75,0.35)',
    ctaLabel:    'Apply Now',
    ctaHref:     `${ROUTES.cryptoFunding}#apply`,
    aurora:      GRADIENTS.auroraViolet,
  },
  markets: {
    activeColor: COLORS.cyan,
    ctaGradient: GRADIENTS.brandElectric,
    ctaShadow:   '0 4px 20px rgba(34,211,238,0.25)',
    ctaLabel:    'Enter Markets',
    ctaHref:     `${ROUTES.predictionMarkets}#markets`,
    aurora:      GRADIENTS.auroraCyan,
  },
};

// ── Logo ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href={ROUTES.cryptoFunding} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Logomark */}
        <div
          style={{
            width:        '30px',
            height:       '30px',
            borderRadius: '8px',
            background:   GRADIENTS.brandPrimary,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            boxShadow:    '0 0 20px rgba(124,106,247,0.40)',
            flexShrink:   0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize:   '13px',
              fontWeight: 900,
              color:      '#FFFFFF',
              lineHeight: 1,
            }}
          >
            N
          </span>
        </div>
        {/* Wordmark */}
        <span
          style={{
            fontWeight:    700,
            fontSize:      '13px',
            letterSpacing: '0.12em',
            color:         '#E8EDF8',
            textTransform: 'uppercase',
          }}
        >
          NEON FUNDED
        </span>
      </div>
    </Link>
  );
}

// ── Mobile menu ───────────────────────────────────────────────────────────

interface MobileMenuProps {
  open: boolean;
  pathname: string;
  variant: NavVariant;
  vc: VariantConfig;
  onClose: () => void;
}

function MobileMenu({ open, pathname, variant, vc, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position:      'absolute',
            top:           '64px',
            left:          0,
            right:         0,
            background:    'rgba(4,8,15,0.97)',
            backdropFilter:'blur(24px)',
            borderBottom:  '1px solid rgba(255,255,255,0.07)',
            padding:       '16px 24px 24px',
            zIndex:        49,
          }}
        >
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  style={{
                    display:       'block',
                    padding:       '12px 16px',
                    borderRadius:  '10px',
                    fontSize:      '15px',
                    fontWeight:    isActive ? 600 : 400,
                    color:         isActive ? vc.activeColor : '#8895AB',
                    textDecoration:'none',
                    background:    isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition:    'all 120ms ease',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href={ROUTES.terminal}
              onClick={onClose}
              style={{
                display:       'block',
                padding:       '13px 20px',
                borderRadius:  '10px',
                border:        '1px solid rgba(255,255,255,0.10)',
                fontSize:      '14px',
                fontWeight:    500,
                color:         '#8895AB',
                textDecoration:'none',
                textAlign:     'center',
                transition:    'all 150ms ease',
              }}
            >
              Log in
            </Link>
            <Link
              href={vc.ctaHref}
              onClick={onClose}
              style={{
                display:       'block',
                padding:       '13px 20px',
                borderRadius:  '10px',
                background:    vc.ctaGradient,
                fontSize:      '14px',
                fontWeight:    700,
                color:         '#FFFFFF',
                textDecoration:'none',
                textAlign:     'center',
                boxShadow:     vc.ctaShadow,
              }}
            >
              {vc.ctaLabel} →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Hamburger icon ────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div
      style={{
        width:  '20px',
        height: '14px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={
            open
              ? i === 0
                ? { rotate: 45,  y: 6,  opacity: 1 }
                : i === 1
                ? { opacity: 0 }
                : { rotate: -45, y: -6, opacity: 1 }
              : { rotate: 0, y: 0, opacity: 1 }
          }
          transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display:      'block',
            width:        '100%',
            height:       '1.5px',
            background:   '#8895AB',
            borderRadius: '2px',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}

// ── NeonNav ────────────────────────────────────────────────────────────────

export function NeonNav() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const pathname                      = usePathname();

  // Resolve variant from pathname
  const variant: NavVariant = pathname?.includes('prediction-markets') ? 'markets' : 'funding';
  const vc = VARIANT_CONFIG[variant];

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header
      style={{
        position:   'sticky',
        top:        0,
        zIndex:     50,
        height:     '64px',
        transition: 'background 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease',
        background: scrolled ? 'rgba(4,8,15,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid transparent',
      }}
    >
      {/* Aurora top line — always visible */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '1px',
          background: vc.aurora,
          transition: 'background 400ms ease',
        }}
      />

      {/* Inner layout */}
      <div
        style={{
          maxWidth:      '1280px',
          margin:        '0 auto',
          padding:       '0 32px',
          height:        '100%',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          position:      'relative',
        }}
      >
        {/* Logo */}
        <Logo />

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          style={{ display: 'flex', gap: '32px' }}
          className="hidden lg:flex"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize:      '13px',
                  fontWeight:    isActive ? 600 : 400,
                  color:         isActive ? vc.activeColor : '#8895AB',
                  textDecoration:'none',
                  letterSpacing: '0.02em',
                  transition:    'color 150ms ease',
                  lineHeight:    1,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: CTA group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Login — hidden on mobile */}
          <Link
            href={ROUTES.terminal}
            className="hidden sm:block"
            style={{
              fontSize:      '13px',
              fontWeight:    500,
              color:         '#8895AB',
              textDecoration:'none',
              padding:       '8px 16px',
              border:        '1px solid rgba(255,255,255,0.08)',
              borderRadius:  '8px',
              transition:    'all 150ms ease',
              lineHeight:    1,
            }}
          >
            Log in
          </Link>

          {/* Primary CTA — always visible */}
          <motion.a
            href={vc.ctaHref}
            whileHover={{ scale: 1.03, boxShadow: vc.ctaShadow.replace('0.35', '0.55') }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              padding:       '9px 20px',
              background:    vc.ctaGradient,
              borderRadius:  '8px',
              fontSize:      '13px',
              fontWeight:    700,
              color:         '#FFFFFF',
              textDecoration:'none',
              boxShadow:     vc.ctaShadow,
              letterSpacing: '0.02em',
              lineHeight:    1,
              cursor:        'pointer',
              whiteSpace:    'nowrap',
            }}
          >
            {vc.ctaLabel} →
          </motion.a>

          {/* Hamburger — visible below lg */}
          <motion.button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            whileTap={{ scale: 0.92 }}
            className="flex lg:hidden"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '40px',
              height:         '40px',
              background:     'rgba(255,255,255,0.05)',
              border:         '1px solid rgba(255,255,255,0.08)',
              borderRadius:   '8px',
              cursor:         'pointer',
              outline:        'none',
            }}
          >
            <HamburgerIcon open={mobileOpen} />
          </motion.button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <MobileMenu
        open={mobileOpen}
        pathname={pathname ?? ''}
        variant={variant}
        vc={vc}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
