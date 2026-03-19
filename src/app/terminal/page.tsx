import type { Metadata } from 'next';
import { TerminalShell } from '@/components/terminal/TerminalShell';

export const metadata: Metadata = {
  title: 'Neon Terminal',
  description: 'Crypto perpetuals trading terminal — Bybit',
};

/**
 * Server component entry point.  All interactivity lives inside TerminalShell
 * (the client boundary).  This file stays lean and server-renderable.
 */
export default function TerminalPage() {
  return <TerminalShell />;
}
