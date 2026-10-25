/**
 * Companion Creature Card Component
 * Displays the climber's companion avatar, current rank title, circular level progress ring,
 * and upcoming evolution milestones.
 */

import type { ReactNode } from 'react';
import { CREATURE_STAGES, type CreatureStage, type LevelProgress, type Rank } from '../game/xp';

interface Props {
  creature: CreatureStage;
  progress: LevelProgress;
  next: CreatureStage | null;
  rank: Rank;
  nextRank: Rank | null;
}

const R = 40;
const CIRC = 2 * Math.PI * R;

/** Expedition spirit: rank title, circular ascent meter, evolution chain. */
export function CreatureCard({ creature, progress, next, rank, nextRank }: Props): ReactNode {
  return (
    <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" role="img" aria-label={`Level ${progress.level}, ${progress.pct}% to next rank`}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={R} fill="none" strokeWidth="8" className="stroke-cream-200 dark:stroke-slate-800" />
            <circle
              cx="48"
              cy="48"
              r={R}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress.pct / 100)}
              transform="rotate(-90 48 48)"
              className="stroke-summit-500 transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-4xl" aria-hidden="true">
            {creature.emoji}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{rank.title}</p>
          <p className="mt-1 truncate text-[13px] font-medium text-ink-500 dark:text-slate-400">
            Rank {progress.level} · {creature.name}
          </p>
          <p className="truncate text-[13px] text-ink-500 dark:text-slate-400">
            {next && nextRank ? `Next: ${next.emoji} ${nextRank.title} at rank ${nextRank.level}` : 'Final form 👑'}
          </p>
        </div>
        <div className="ml-auto shrink-0 text-right">
          <p className="text-sm font-extrabold tabular-nums text-summit-600 dark:text-amber-300">+{progress.xp}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">total XP</p>
        </div>
      </div>
      <ol className="mt-4 flex items-center justify-between gap-0.5 border-t border-cream-200 pt-3 dark:border-slate-800" aria-label="Ascension path">
        {CREATURE_STAGES.map((s) => {
          const reached = progress.level >= s.level;
          const isCurrent = creature.level === s.level;
          return (
            <li
              key={s.level}
              title={reached ? `${s.name} (rank ${s.level})` : `??? (rank ${s.level})`}
              className={`flex flex-col items-center gap-0.5 ${reached ? '' : 'opacity-30 grayscale'}`}
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${isCurrent ? 'bg-slate-800 text-white dark:bg-amber-400' : ''}`}
              >
                {reached ? s.emoji : '❔'}
              </span>
              <span className="text-[10px] font-bold tabular-nums text-slate-400">{s.level}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
