import type { Checkin, Reflection, Task } from '../types';
import { addDays } from '../utils/dates';

// GLOBAL daily streak: a day counts if the user did ANYTHING —
// a habit check-in, a finished task, or a reflection.
// Unlike per-habit tolerant streaks, one fully idle day freezes this one.

export function activeDates(
  checkins: Checkin[],
  tasks: Task[],
  reflections: Reflection[],
): Set<string> {
  const s = new Set<string>();
  for (const c of checkins) s.add(c.date);
  for (const t of tasks) if (t.done) s.add(t.date);
  for (const r of reflections) s.add(r.date);
  return s;
}

/** Consecutive active days. If today is still empty, count back from yesterday. */
export function dailyStreak(dates: Set<string>, ref: string): number {
  let cursor = dates.has(ref) ? ref : addDays(ref, -1);
  let n = 0;
  for (let i = 0; i < 3660; i += 1) {
    if (!dates.has(cursor)) break;
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function lastActiveDate(dates: Set<string>): string | null {
  let best: string | null = null;
  for (const d of dates) {
    if (best === null || d > best) best = d;
  }
  return best;
}
