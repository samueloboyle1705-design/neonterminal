'use client';

import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warn' | 'error';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: number;
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface NotificationState {
  notifications: AppNotification[];
}

interface NotificationActions {
  add: (notification: AppNotification) => void;
  remove: (id: string) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()((set) => ({
  notifications: [],

  add: (notification) =>
    set(
      (s) => ({ notifications: [...s.notifications, notification] }),
    ),

  remove: (id) =>
    set(
      (s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }),
    ),
}));

// ── Module-level helper — callable outside React ──────────────────────────────

/**
 * Show a terminal-style toast notification.
 * Auto-dismisses after 4 s.  Safe to call from simulator, execution engine, etc.
 */
export function notify(message: string, type: NotificationType = 'info'): void {
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  useNotificationStore.getState().add({ id, message, type, createdAt: Date.now() });
  setTimeout(() => useNotificationStore.getState().remove(id), 4_000);
}
