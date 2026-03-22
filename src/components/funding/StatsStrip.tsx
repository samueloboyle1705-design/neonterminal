/**
 * StatsStrip
 *
 * Full-width trust/metrics strip. Five ruled columns with large numbers.
 * Tinted background panel with top/bottom borders.
 * Server component.
 */

import { COLORS } from '@/lib/neon/constants';

const STATS = [
  { value: '$47.2M',  label: 'Total Capital Deployed',  color: COLORS.green  },
  { value: '3,847',   label: 'Active Funded Traders',   color: COLORS.violet },
  { value: '67%',     label: 'Average Win Rate',         color: COLORS.cyan   },
  { value: '$1.2M',   label: 'Paid Out This Month',      color: COLORS.gold   },
  { value: '92%',     label: 'Challenge Pass Rate',      color: COLORS.green  },
] as const;

export function StatsStrip() {
  return (
    <div
      style={{
        position:     'relative',
        zIndex:       1,
        background:   'rgba(8,13,24,0.65)',
        borderTop:    '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin:   '0 auto',
          padding:  '0 32px',
        }}
      >
        {/* Grid of stats */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            borderLeft:          '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {STATS.map(({ value, label, color }) => (
            <div
              key={label}
              style={{
                padding:     '40px 24px',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                textAlign:   'center',
              }}
            >
              <div
                style={{
                  fontFamily:        'var(--font-geist-mono)',
                  fontSize:          'clamp(28px, 3.5vw, 40px)',
                  fontWeight:        800,
                  color,
                  letterSpacing:     '-0.025em',
                  lineHeight:        1,
                  fontVariantNumeric:'tabular-nums',
                  marginBottom:      '8px',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize:      '11px',
                  color:         COLORS.textTertiary,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight:    1.4,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: 2-col grid (hidden on desktop via grid-template override) */}
        {/* Note: the grid above collapses responsively via CSS only approach.
            On smaller screens, the 5-col rule grid will compress. To fully
            handle mobile, page-level CSS or a responsive wrapper is recommended.
            Mobile stat row is provided via FundingHero for the primary CTA zone. */}
      </div>
    </div>
  );
}
