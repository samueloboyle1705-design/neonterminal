'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import { TIMEFRAME_MAP } from '@/lib/marketData';
import type { DisplayTimeframe } from '@/lib/marketData';

const TIMEFRAMES = Object.keys(TIMEFRAME_MAP) as DisplayTimeframe[];

export function TimeframeTabs() {
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const setSelectedTimeframe = useTerminalStore((s) => s.setSelectedTimeframe);

  return (
    <div className="h-9 flex items-center gap-0.5 px-3 border-b border-t-border bg-t-panel shrink-0">
      <span className="text-xs font-mono text-t-muted uppercase tracking-widest pr-3">
        TF
      </span>
      {TIMEFRAMES.map((tf) => {
        const isActive = tf === selectedTimeframe;
        return (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={[
              'px-2.5 py-1 text-xs font-mono rounded-sm transition-colors duration-100',
              isActive
                ? 'bg-t-surface text-t-green'
                : 'text-t-sub hover:text-t-text hover:bg-t-surface',
            ].join(' ')}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}
