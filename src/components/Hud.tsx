/**
 * Heads-Up Display (HUD) & Level-Up Modal
 * Renders top-bar player status badges (streak, route position, rank, XP bar)
 * and the milestone level-up celebration modal.
 */

import type { ReactNode } from 'react';
import type { AscentStage, LevelProgress, Rank } from '../game/xp';
import { showsStreak } from '../utils/streak';

/** Compact status indicator pills displayed in the top navbar */
export function HudStats({
  progress,
  ascent,
  streak,
  rank,
}: {
  progress: LevelProgress;
  ascent: AscentStage;
  streak: number;
  rank: Rank;
}): ReactNode {
  const rankPill = (
    <>
      <span aria-hidden="true">{ascent.emoji}</span>
      <span className="max-sm:hidden">{rank.short}</span>
    </>
  );
  return (
    <div className="flex items-center gap-1.5 max-md:gap-1" title={`${progress.xp} XP total · ${streak}-day streak · ${rank.title} (rank ${progress.level})`}>
      {showsStreak(streak) ? (
        <span className="flex min-h-[32px] items-center gap-1 rounded-full bg-orange-100 px-2.5 text-xs font-extrabold tabular-nums text-orange-700 max-md:px-2 dark:bg-orange-950 dark:text-orange-300">
          <span aria-hidden="true">🔥</span> {streak}
        </span>
      ) : null}
      <span className="flex min-h-[32px] items-center gap-1.5 rounded-full bg-slate-800 px-2.5 text-xs font-extrabold text-white dark:bg-emerald-600 max-md:px-2">
        {rankPill}
      </span>
      <div
        className="h-2 w-16 overflow-hidden rounded-full bg-cream-200 max-sm:hidden dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={progress.current}
        aria-valuemin={0}
        aria-valuemax={progress.needed}
        aria-label={`Level ${progress.level} progress`}
      >
        <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
      </div>
    </div>
  );
}

/** Celebration modal shown when player advances to a higher level */
export function LevelUpModal({
  level,
  rank,
  ascent,
  onClose,
}: {
  level: number;
  rank: Rank;
  ascent: AscentStage;
  onClose: () => void;
}): ReactNode {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Rank up">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-3xl bg-cream-50 p-8 text-center shadow-2xl dark:bg-slate-800">
        <p className="section-title text-amber-600 dark:text-amber-300">Rank up · {level}</p>
        <p className="mt-3 text-7xl motion-safe:animate-bounce" aria-hidden="true">
          {ascent.emoji}
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">{rank.title}</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
          {ascent.name} — {ascent.tagline}
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-5 min-h-[48px] w-full rounded-full bg-slate-800 font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Keep ascending →
        </button>
      </div>
    </div>
  );
}
