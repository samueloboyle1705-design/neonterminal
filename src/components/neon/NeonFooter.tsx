/**
 * NeonFooter
 *
 * Shared marketing footer. Three-column link grid + legal row.
 * Server component — zero JS.
 */

import Link from 'next/link';
import { GlowDivider } from './GlowDivider';
import { GRADIENTS, ROUTES, COLORS } from '@/lib/neon/constants';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Trading Terminal', href: ROUTES.terminal },
    { label: 'Market Data',      href: '#' },
    { label: 'API Access',       href: '#' },
  ],
  Products: [
    { label: 'Funded Trading',     href: ROUTES.cryptoFunding },
    { label: 'Prediction Markets', href: ROUTES.predictionMarkets },
    { label: 'Research Tools',     href: '#' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Risk Disclosure',  href: '#' },
  ],
};

export function NeonFooter() {
  return (
    <footer
      style={{
        position:   'relative',
        zIndex:     1,
        background: 'rgba(4,8,15,0.80)',
        borderTop:  '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Glow divider at the very top of footer */}
      <GlowDivider variant="violet" bloom style={{ marginBottom: '-1px' }} />

      <div
        style={{
          maxWidth: '1280px',
          margin:   '0 auto',
          padding:  '64px 32px 40px',
        }}
      >
        {/* Top: brand + link columns */}
        <div
          style={{
            display:  'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap:      '48px',
            marginBottom: '56px',
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width:        '28px',
                  height:       '28px',
                  borderRadius: '7px',
                  background:   GRADIENTS.brandPrimary,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  boxShadow:    '0 0 16px rgba(124,106,247,0.35)',
                  flexShrink:   0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize:   '12px',
                    fontWeight: 900,
                    color:      '#FFFFFF',
                  }}
                >
                  N
                </span>
              </div>
              <span
                style={{
                  fontWeight:    700,
                  fontSize:      '13px',
                  letterSpacing: '0.10em',
                  color:         '#E8EDF8',
                  textTransform: 'uppercase',
                }}
              >
                NEON FUNDED
              </span>
            </div>

            {/* Brand tagline */}
            <p
              style={{
                fontSize:   '13px',
                lineHeight: 1.65,
                color:      COLORS.textTertiary,
                maxWidth:   '220px',
              }}
            >
              Built for elite traders. Funded capital, real performance, full transparency.
            </p>

            {/* Status indicator */}
            <div
              style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        '6px',
                fontSize:   '11px',
                fontFamily: 'var(--font-geist-mono)',
                color:      COLORS.green,
                letterSpacing: '0.06em',
              }}
            >
              <span
                style={{
                  width:        '6px',
                  height:       '6px',
                  borderRadius: '50%',
                  background:   COLORS.green,
                  display:      'inline-block',
                }}
              />
              ALL SYSTEMS OPERATIONAL
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span
                style={{
                  fontFamily:    'var(--font-geist-mono)',
                  fontSize:      '10px',
                  fontWeight:    600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color:         COLORS.textTertiary,
                }}
              >
                {category}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      fontSize:      '13px',
                      color:         COLORS.textSecondary,
                      textDecoration:'none',
                      transition:    'color 120ms ease',
                      lineHeight:    1,
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom legal row */}
        <div
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            flexWrap:        'wrap',
            gap:             '16px',
            paddingTop:      '24px',
            borderTop:       '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p
            style={{
              fontSize:   '12px',
              color:      COLORS.textDisabled,
              lineHeight: 1,
            }}
          >
            © {new Date().getFullYear()} Neon Funded. All rights reserved.
          </p>

          <p
            style={{
              fontSize:   '11px',
              color:      COLORS.textDisabled,
              lineHeight: 1.5,
              maxWidth:   '480px',
              textAlign:  'right',
            }}
          >
            Trading involves substantial risk of loss. Past performance does not guarantee future results.
            Funded accounts are subject to risk parameters and drawdown rules.
          </p>
        </div>
      </div>
    </footer>
  );
}
