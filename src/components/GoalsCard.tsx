/**
 * Goals Card
 * The North Star section at the top of Today: every goal with its reason and
 * deadline, so the reminder is visible the moment the app opens.
 */

import { useState, type ReactNode } from 'react';
import type { useGoals } from '../hooks/useGoals';
import { formatGoalDate, goalDeadlineLabel } from '../utils/goals';
import { EmptyState } from './EmptyState';
import { GoalsPanel } from './GoalsPanel';

interface Props {
  goalsApi: ReturnType<typeof useGoals>;
  todayKey: string;
}

/** Card listing the user's goals, with the goal editor behind one button. */
export function GoalsCard({ goalsApi, todayKey }: Props): ReactNode {
  const [open, setOpen] = useState(false);
  const { goals } = goalsApi;

  return (
    <section
      aria-label="Goals"
      className="mt-6 rounded-3xl border border-amber-200/70 bg-amber-50/60 p-5 max-md:p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="section-title text-amber-700 dark:text-amber-300">North Star</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            <span aria-hidden="true">🎯 </span>Goals
          </h2>
          <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
            What this climb is for. Read it before the day starts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[32px] shrink-0 items-center gap-1 rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200 max-md:min-h-[44px] dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-900"
        >
          <span aria-hidden="true">✎</span> {goals.length === 0 ? 'Write goals' : 'Edit goals'}
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          message="No goals yet."
          hint="Write what you are climbing toward — it shows here every day."
        />
      ) : (
        <ul className="mt-3 space-y-2">
          {goals.map((goal) => {
            const date = formatGoalDate(goal.targetDate);
            const countdown = goalDeadlineLabel(goal.targetDate, todayKey);
            return (
              <li
                key={goal.id}
                className="rounded-2xl border border-amber-200/60 bg-cream-50/80 px-3.5 py-3 dark:border-amber-900/40 dark:bg-slate-900/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 flex-1 text-[15px] font-semibold">{goal.title}</p>
                  {date ? (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 tabular-nums dark:bg-amber-950 dark:text-amber-200">
                      {date}
                      {countdown ? ` · ${countdown}` : ''}
                    </span>
                  ) : null}
                </div>
                {goal.why ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-500 dark:text-slate-400">
                    {goal.why}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {open ? (
        <GoalsPanel goalsApi={goalsApi} todayKey={todayKey} onClose={() => setOpen(false)} />
      ) : null}
    </section>
  );
}
