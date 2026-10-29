/**
 * Achievement Unlock Toast
 * Small celebratory card shown the moment a badge unlocks.
 */

import type { ReactNode } from 'react';
import type { UnlockToast } from '../hooks/useAchievementToasts';

interface Props {
  toast: UnlockToast | null;
  queued: number;
  onDismiss: () => void;
}

export function AchievementToast({ toast, queued, onDismiss }: Props): ReactNode {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-sm sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-summit-500/40 bg-cream-50 p-3.5 shadow-2xl dark:border-amber-400/40 dark:bg-slate-800">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-summit-500/15 text-2xl motion-safe:animate-bounce dark:bg-amber-400/15"
        >
          {toast.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-summit-600 dark:text-amber-300">
            {toast.summary ? 'Achievements' : 'Achievement unlocked'}
          </p>
          <p className="mt-0.5 text-sm font-bold leading-tight">{toast.name}</p>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-slate-400">{toast.desc}</p>
          {queued > 0 ? (
            <p className="mt-1 text-[11px] font-medium text-slate-400">+{queued} more unlocking</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss achievement notification"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-cream-200 hover:text-ink-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <span aria-hidden="true" className="text-sm">
            ✕
          </span>
        </button>
      </div>
    </div>
  );
}
