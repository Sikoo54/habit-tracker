/**
 * Rank Ladder
 * Shows every rank in order so the climb is visible: what you have earned,
 * where you stand now, and how much XP the next title needs.
 */

import type { ReactNode } from 'react';
import { ASCENT_STAGES, RANKS, xpThreshold, type Rank } from '../game/xp';

interface Props {
  xp: number;
  level: number;
  rank: Rank;
}

/** Full ladder from Grinder to Ascendant One. */
export function RankLadder({ xp, level, rank }: Props): ReactNode {
  const next = RANKS.find((r) => r.level === level + 1) ?? null;
  const toNext = next ? Math.max(0, xpThreshold(next.level) - xp) : 0;

  return (
    <section aria-labelledby="rank-ladder-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="rank-ladder-title" className="section-title text-slate-400 dark:text-slate-500">
          Rank ladder
        </h2>
        <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
          {rank.title} · {xp.toLocaleString('en-US')} XP
        </span>
      </div>
      <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
        {next ? (
          <>
            <strong className="font-semibold text-sage-700 dark:text-emerald-300">{toNext.toLocaleString('en-US')} XP</strong> to {next.title}.
          </>
        ) : (
          'Top rank reached — now the job is keeping it.'
        )}
      </p>

      <ol className="mt-3 divide-y divide-cream-200 dark:divide-slate-800">
        {RANKS.map((r) => {
          const stage = ASCENT_STAGES.find((s) => s.level === r.level);
          const reached = level >= r.level;
          const isCurrent = level === r.level;
          return (
            <li
              key={r.level}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center gap-3 rounded-xl px-2 py-2.5 ${
                isCurrent ? 'bg-sage-50 dark:bg-emerald-950/40' : ''
              }`}
            >
              <span className={`text-lg ${reached ? '' : 'opacity-40 grayscale'}`} aria-hidden="true">
                {stage?.emoji ?? '⛰️'}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${isCurrent ? 'font-semibold' : 'font-medium'} ${reached ? '' : 'text-slate-400 dark:text-slate-500'}`}>
                  {r.title}
                </p>
                <p className="truncate text-[12px] text-slate-400 dark:text-slate-500">
                  Rank {r.level} · {stage?.name ?? 'Trail'}
                </p>
              </div>
              <span className="shrink-0 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 tabular-nums">
                {isCurrent ? (
                  <span className="rounded-full bg-sage-500 px-2 py-1 text-white dark:bg-emerald-500 dark:text-emerald-950">You are here</span>
                ) : reached ? (
                  <span className="text-sage-600 dark:text-emerald-300">✓ Done</span>
                ) : (
                  `at ${xpThreshold(r.level).toLocaleString('en-US')} XP`
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
