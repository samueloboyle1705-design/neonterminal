/**
 * Marketing layout
 *
 * Shared layout for /crypto-funding and /prediction-markets.
 * The (marketing) route group does NOT affect the URL — it is
 * purely an organisational boundary that allows this layout to
 * wrap both pages without touching /terminal.
 *
 * Renders:
 *   NeonNav (sticky, client — reads pathname for variant)
 *   {children}  — each page owns its CosmicBackground
 *   NeonFooter
 *
 * The scroll container sits here so the sticky nav inside it
 * receives scroll events from this element.
 *
 * Server component.
 */

import type { Metadata } from 'next';
import { NeonNav }    from '@/components/neon/NeonNav';
import { NeonFooter } from '@/components/neon/NeonFooter';

export const metadata: Metadata = {
  title: {
    template: '%s | Neon Funded',
    default:  'Neon Funded',
  },
  description:
    'Elite funded trading and prediction markets. Trade with firm capital. Prove your edge.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * height: 100vh + overflowY: auto creates the scroll container.
     * This is necessary because globals.css no longer sets overflow:hidden
     * on body (that was removed so marketing pages can scroll).
     * The terminal sets its own overflow:hidden via TerminalShell className.
     */
    <div
      style={{
        height:    '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position:  'relative',
        background:'#02040A',
        color:     '#E8EDF8',
      }}
    >
      <NeonNav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <NeonFooter />
    </div>
  );
}
