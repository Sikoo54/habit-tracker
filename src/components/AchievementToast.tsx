/**
 * Achievement Unlock Toast
 * Small celebratory card shown the moment a badge unlocks, tinted by tier.
 */

import type { ReactNode } from 'react';
import type { AchievementTier } from '../game/achievements';
import type { UnlockToast } from '../hooks/useAchievementToasts';

const TIER_HEAD: Record<AchievementTier, string> = {
  bronze: 'text-amber-700 dark:text-amber-300',
  silver: 'text-slate-500 dark:text-slate-300',
  gold: 'text-yellow-700 dark:text-yellow-300',
};

const TIER_ICON: Record<AchievementTier, string> = {
  bronze: 'bg-amber-500/15 dark:bg-amber-400/15',
  silver: 'bg-slate-500/15 dark:bg-slate-300/15',
  gold: 'bg-yellow-500/15 dark:bg-yellow-400/15',
};

const TIER_LABEL: Record<AchievementTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
};

interface Props {
  toast: UnlockToast | null;
  queued: number;
  onDismiss: () => void;
}

/** Bottom-right card announcing a freshly unlocked badge; dismissable. */
export function AchievementToast({ toast, queued, onDismiss }: Props): ReactNode {
  if (!toast) return null;

  const tier = toast.tier ?? 'bronze';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-sm sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-summit-500/40 bg-cream-50 p-3.5 shadow-2xl dark:border-amber-400/40 dark:bg-slate-800">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl motion-safe:animate-bounce ${
            toast.summary ? 'bg-summit-500/15 dark:bg-amber-400/15' : TIER_ICON[tier]
          }`}
        >
          {toast.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
              toast.summary ? 'text-summit-600 dark:text-amber-300' : TIER_HEAD[tier]
            }`}
          >
            {toast.summary ? 'Achievements' : `${TIER_LABEL[tier]} achievement unlocked`}
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
