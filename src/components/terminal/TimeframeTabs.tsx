'use client';

import { useTerminalStore } from '@/stores/terminal-store';
import { TIMEFRAME_MAP } from '@/lib/marketData';
import type { DisplayTimeframe } from '@/lib/marketData';

const TIMEFRAMES = Object.keys(TIMEFRAME_MAP) as DisplayTimeframe[];

export function TimeframeTabs() {
  const selectedTimeframe = useTerminalStore((s) => s.selectedTimeframe);
  const setSelectedTimeframe = useTerminalStore((s) => s.setSelectedTimeframe);

  return (
    <div className="h-9 flex items-stretch gap-0 px-3 border-b border-t-border bg-t-panel shrink-0">
      {TIMEFRAMES.map((tf) => {
        const isActive = tf === selectedTimeframe;
        return (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={[
              'relative px-3 text-xs font-mono transition-colors duration-100',
              'flex items-center',
              isActive
                ? 'text-t-cyan'
                : 'text-t-muted hover:text-t-sub',
            ].join(' ')}
          >
            {tf}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-t-cyan" />
            )}
          </button>
        );
      })}
    </div>
  );
}
