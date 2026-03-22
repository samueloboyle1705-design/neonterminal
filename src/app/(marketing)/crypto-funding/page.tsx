/**
 * /crypto-funding
 *
 * Crypto Funding page — placeholder.
 * Replace this file with the full page build in the next phase.
 */

import type { Metadata } from 'next';
import { CosmicBackground } from '@/components/neon/CosmicBackground';

export const metadata: Metadata = {
  title: 'Funded Trading',
  description:
    'Trade with up to $250,000 of firm capital. Prove your edge, scale your returns, keep up to 90% of profits.',
};

export default function CryptoFundingPage() {
  return (
    <>
      <CosmicBackground variant="funding" />
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
          Crypto Funding page — coming in next phase
        </p>
      </div>
    </>
  );
}
