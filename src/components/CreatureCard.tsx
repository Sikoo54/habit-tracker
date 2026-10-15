import type { ReactNode } from 'react';
import { CREATURE_STAGES, type CreatureStage, type LevelProgress } from '../game/xp';

interface Props {
  creature: CreatureStage;
  progress: LevelProgress;
  next: CreatureStage | null;
}

/** Companion panel: current evolution, XP to next form, full evolution chain. */
export function CreatureCard({ creature, progress, next }: Props): ReactNode {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sage-100 to-cream-50 p-5 dark:from-slate-800 dark:to-slate-800/60">
      <div className="flex items-center gap-4">
        <span className="text-6xl" aria-hidden="true">
          {creature.emoji}
        </span>
        <div className="min-w-0">
          <p className="section-title text-sage-600 dark:text-emerald-300">Your companion · Lv {progress.level}</p>
          <p className="text-lg font-extrabold leading-tight">{creature.name}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{creature.tagline}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>
            {next ? `Next: ${next.emoji} ${next.name} at Lv ${next.level}` : 'Final form reached 👑'}
          </span>
          <span className="tabular-nums">
            {progress.current}/{progress.needed} XP
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900">
          <div className="h-full rounded-full bg-gradient-to-r from-sage-500 to-amber-400 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>
      <ol className="mt-3 flex items-center justify-between" aria-label="Evolution chain">
        {CREATURE_STAGES.map((s) => {
          const reached = progress.level >= s.level;
          return (
            <li
              key={s.level}
              title={reached ? `${s.name} (Lv ${s.level})` : `??? (Lv ${s.level})`}
              className={`text-xl max-md:text-base ${reached ? '' : 'opacity-25 grayscale'}`}
              aria-label={reached ? s.name : `Locked until level ${s.level}`}
            >
              <span aria-hidden="true">{reached ? s.emoji : '❔'}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
