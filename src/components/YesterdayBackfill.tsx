/**
 * Yesterday Backfill
 * A quiet disclosure under the Main Quest that lets the climber log a habit
 * they forgot to tap before midnight, or explicitly mark it as not done.
 * Entries written the next day stay marked "late" so the record never pretends
 * otherwise. Pressing Done closes the panel until the next day.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Checkin, Habit } from '../types';
import {
  checkinsByHabit,
  isLateCheckin,
  markBackfillDone,
  readBackfillDone,
} from '../utils/checkins';
import { formatTanggalID } from '../utils/dates';

interface Props {
  /** Active habits that already existed yesterday. */
  habits: Habit[];
  checkins: Checkin[];
  /** Yesterday's date key. */
  date: string;
  onSet: (habitId: string, done: boolean) => void;
}

/** Disclosure listing yesterday's habits with done / not done controls. */
export function YesterdayBackfill({ habits, checkins, date, onSet }: Props): ReactNode {
  const [doneFor, setDoneFor] = useState<string | null>(readBackfillDone);
  const byHabit = checkinsByHabit(checkins, date);
  const logged = habits.filter((h) => byHabit.has(h.id)).length;

  if (habits.length === 0 || doneFor === date) return null;
  const complete = logged === habits.length;

  const chip =
    'min-h-[36px] rounded-lg px-2.5 text-[13px] font-semibold transition-colors';

  return (
    <details className="group mt-4 rounded-2xl border border-cream-200 bg-cream-100/50 dark:border-slate-700 dark:bg-slate-800/40">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-ink-600 hover:text-ink-700 dark:text-slate-300 dark:hover:text-slate-100 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true">🕯️</span>
        Fix yesterday
        <span
          className={`ml-auto text-xs font-medium tabular-nums ${
            complete
              ? 'text-sage-700 dark:text-emerald-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {complete ? 'all logged ✓' : `${logged}/${habits.length} logged`}
        </span>
      </summary>

      <div className="px-4 pb-4 pt-1">
        <p className="text-[13px] text-ink-500 dark:text-slate-400">
          Forgot to tap before midnight? Log it now for {formatTanggalID(date)}. It still counts
          for XP and streak, and stays marked as late. If it truly did not happen, set it to
          <strong> Not done</strong>.
        </p>

        <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-700/60">
          {habits.map((h) => {
            const c = byHabit.get(h.id);
            return (
              <li key={h.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {h.name}
                  {c && isLateCheckin(c) ? (
                    <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      late
                    </span>
                  ) : null}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={Boolean(c)}
                    onClick={() => onSet(h.id, true)}
                    aria-label={`${h.name} was done yesterday`}
                    className={`${chip} ${
                      c
                        ? 'bg-sage-600 text-white'
                        : 'border border-cream-300 text-ink-600 hover:bg-cream-200/70 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    aria-pressed={!c}
                    onClick={() => onSet(h.id, false)}
                    aria-label={`${h.name} was not done yesterday`}
                    className={`${chip} ${
                      !c
                        ? 'bg-cream-300/80 text-ink-700 dark:bg-slate-700 dark:text-slate-100'
                        : 'border border-cream-300 text-ink-500 hover:bg-cream-200/70 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    Not done
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => {
            markBackfillDone(date);
            setDoneFor(date);
          }}
          className="mt-3 min-h-[44px] w-full rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Done
        </button>
      </div>
    </details>
  );
}
