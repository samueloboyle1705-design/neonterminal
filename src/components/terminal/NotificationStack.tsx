'use client';

import { useNotificationStore } from '@/stores/notification-store';
import type { AppNotification } from '@/stores/notification-store';

// ── Styles per notification type ──────────────────────────────────────────────

const TYPE_STYLES: Record<AppNotification['type'], string> = {
  info:    'border-t-border    bg-t-panel/95 text-t-sub',
  success: 'border-t-green/30 bg-t-green-dim/80 text-t-green',
  warn:    'border-t-amber/30 bg-t-surface/95 text-t-amber',
  error:   'border-t-red/30   bg-t-red-dim/80 text-t-red',
};

const TYPE_DOT: Record<AppNotification['type'], string> = {
  info:    'bg-t-border-hi',
  success: 'bg-t-green',
  warn:    'bg-t-amber',
  error:   'bg-t-red',
};

// ── NotificationStack ─────────────────────────────────────────────────────────

export function NotificationStack() {
  const notifications = useNotificationStore((s) => s.notifications);
  const remove        = useNotificationStore((s) => s.remove);

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-14 right-4 z-50 flex flex-col gap-1.5 pointer-events-none"
      aria-live="polite"
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className={[
            'flex items-center gap-2.5 px-3 py-2 rounded border backdrop-blur-sm',
            'text-[11px] font-mono whitespace-nowrap pointer-events-auto',
            'animate-in fade-in slide-in-from-right-4 duration-200',
            TYPE_STYLES[n.type],
          ].join(' ')}
        >
          <span className={`block w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT[n.type]}`} />
          <span className="flex-1">{n.message}</span>
          <button
            onClick={() => remove(n.id)}
            className="ml-1 text-current opacity-40 hover:opacity-80 transition-opacity text-xs leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
