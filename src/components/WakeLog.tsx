/**
 * Wake-up Log
 * Lists the clock time saved by each morning tap, newest day first, with the
 * average so the routine is visible instead of remembered.
 */

import type { ReactNode } from 'react';
import { averageWake, wakeLog } from '../game/attendance';
import type { Attendance } from '../types';
import { addDays, formatDateShort } from '../utils/dates';

interface Props {
  attendance: Attendance[];
  /** Today's date key, used to label the newest rows. */
  today: string;
  /** Days to show, newest first. */
  limit?: number;
}

/** Friendly row label: Today, Yesterday, then a compact date. */
function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, -1)) return 'Yesterday';
  return formatDateShort(date);
}

/** Stats section with the wake-up history and its average time. */
export function WakeLog({ attendance, today, limit = 30 }: Props): ReactNode {
  const entries = wakeLog(attendance, limit);
  const average = averageWake(entries);

  return (
    <section aria-label="Wake-up log">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="section-title text-slate-400 dark:text-slate-500">Wake-up log</h2>
        {entries.length > 0 ? (
          <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
            Avg {average} · {entries.length} {entries.length === 1 ? 'day' : 'days'}
          </span>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
          No times yet. The morning gate saves the clock when you tap “I’m awake — begin”.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-cream-200 dark:divide-slate-800">
          {entries.map((entry) => (
            <li key={entry.date} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-ink-600 dark:text-slate-300">
                {dayLabel(entry.date, today)}
              </span>
              <span className="text-sm font-semibold tabular-nums">{entry.time}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
