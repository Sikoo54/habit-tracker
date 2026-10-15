import type { ReactNode } from 'react';
import type { CreatureStage, LevelProgress } from '../game/xp';

export function HudStats({ progress, creature }: { progress: LevelProgress; creature: CreatureStage }): ReactNode {
  return (
    <div className="flex items-center gap-2" title={`${progress.xp} XP total`}>
      <span className="flex min-h-[32px] items-center gap-1 rounded-full bg-slate-800 px-2.5 text-xs font-extrabold text-white dark:bg-emerald-600">
        Lv {progress.level} <span aria-hidden="true">{creature.emoji}</span>
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

export function LevelUpModal({
  level,
  creature,
  onClose,
}: {
  level: number;
  creature: CreatureStage;
  onClose: () => void;
}): ReactNode {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Level up">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-3xl bg-cream-50 p-8 text-center shadow-2xl dark:bg-slate-800">
        <p className="section-title text-amber-600 dark:text-amber-300">Level up!</p>
        <p className="mt-3 text-7xl motion-safe:animate-bounce" aria-hidden="true">
          {creature.emoji}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          Lv {level} — {creature.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{creature.tagline}</p>
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
