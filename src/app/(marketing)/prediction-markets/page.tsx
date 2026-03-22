/**
 * /prediction-markets
 *
 * Prediction Markets page — placeholder.
 * Replace this file with the full page build in the next phase.
 */

import type { Metadata } from 'next';
import { CosmicBackground } from '@/components/neon/CosmicBackground';

export const metadata: Metadata = {
  title: 'Prediction Markets',
  description:
    'Trade on the outcome of real-world events. Live odds, deep liquidity, instant resolution.',
};

export default function PredictionMarketsPage() {
  return (
    <>
      <CosmicBackground variant="markets" />
      <div
        style={{
          minHeight:      '80vh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '80px 32px',
          position:       'relative',
          zIndex:         1,
        }}
      >
        <p
          style={{
            fontFamily:    'var(--font-geist-mono)',
            fontSize:      '13px',
            letterSpacing: '0.10em',
            color:         '#3d4f66',
            textTransform: 'uppercase',
          }}
        >
          Prediction Markets page — coming in next phase
        </p>
      </div>
    </>
  );
}
