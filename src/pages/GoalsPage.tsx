/**
 * Goals Page View
 * The long-range goals and the daily trail note, kept together so the reason
 * for the climb is always one tap away from the daily quest board.
 */

import type { ReactNode } from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { QuoteCard } from '../components/QuoteCard';
import { MAX_GOALS, type useGoals } from '../hooks/useGoals';
import type { useQuotes } from '../hooks/useQuotes';
import { todayKey } from '../utils/dates';
import { daysUntil, formatGoalDate, goalDeadlineLabel } from '../utils/goals';

interface Props {
  goalsApi: ReturnType<typeof useGoals>;
  quotesApi: ReturnType<typeof useQuotes>;
}

/** Decorative compass that gives the direction header a quiet landmark. */
function CompassMark(): ReactNode {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 hidden h-32 w-32 -translate-y-1/2 text-amber-500/35 sm:block dark:text-amber-300/25"
    >
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="60"
        cy="60"
        r="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 5"
      />
      <path
        d="M60 8v9M60 103v9M8 60h9M103 60h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M60 38l5.5 16.5L82 60l-16.5 5.5L60 82l-5.5-16.5L38 60l16.5-5.5Z"
        fill="currentColor"
      />
      <circle cx="60" cy="60" r="3" className="fill-cream-50 dark:fill-slate-900" />
    </svg>
  );
}

/** Goals and quotes page: what the climb is for, in one place. */
export function GoalsPage({ goalsApi, quotesApi }: Props): ReactNode {
  const today = todayKey();
  const { goals } = goalsApi;
  const featuredCount = goals.filter((goal) => goal.starred).length;

  // The upcoming target date gives the header a concrete next marker.
  const next = goals
    .filter((goal) => {
      if (!goal.targetDate || !formatGoalDate(goal.targetDate)) return false;
      return daysUntil(goal.targetDate, today) >= 0;
    })
    .sort((a, b) => daysUntil(a.targetDate ?? '', today) - daysUntil(b.targetDate ?? '', today))[0];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-cream-50 via-cream-50 to-amber-100/60 p-6 max-md:p-4 dark:border-amber-900/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-amber-950/20">
        <CompassMark />
        <div className="relative max-w-xl sm:pr-32">
          <p className="section-title text-summit-600 dark:text-amber-300">Direction</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight max-md:text-3xl">
            <span aria-hidden="true">🎯 </span>Goals
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-500 dark:text-slate-400">
            What the climb is for. Keep the reason visible, then go clear today&rsquo;s quests.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {featuredCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                <span aria-hidden="true">★</span>
                {featuredCount === 1 ? '1 featured goal' : `${featuredCount} featured goals`}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-cream-200/70 px-2.5 py-1 text-[11px] font-bold text-ink-600 tabular-nums dark:bg-slate-800 dark:text-slate-300">
              {goals.length}/{MAX_GOALS} on the board
            </span>
            {next ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100/80 px-2.5 py-1 text-[11px] font-bold text-sage-700 tabular-nums dark:bg-emerald-950/40 dark:text-emerald-200">
                <span aria-hidden="true">◷</span>
                {formatGoalDate(next.targetDate)} · {goalDeadlineLabel(next.targetDate, today)}
              </span>
            ) : goals.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-cream-200/70 px-2.5 py-1 text-[11px] font-bold text-ink-500 dark:bg-slate-800 dark:text-slate-400">
                No target date yet
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <GoalsCard goalsApi={goalsApi} todayKey={today} />

      <QuoteCard quotesApi={quotesApi} todayKey={today} />
    </div>
  );
}
