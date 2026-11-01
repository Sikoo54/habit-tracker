/**
 * Check-in Timing Helpers
 * Separates a check-in tapped on the day it happened from one logged later, and
 * selects which habits already existed on a given day (for backfill).
 */

import type { Checkin, Habit } from '../types';
import { toDateKey } from './dates';

/**
 * True when the check-in was written on a different local day than the day it
 * covers — i.e. the user forgot to tap and logged it late.
 */
export function isLateCheckin(checkin: Checkin): boolean {
  const written = new Date(checkin.createdAt);
  if (Number.isNaN(written.getTime())) return false;
  return toDateKey(written) !== checkin.date;
}

/** One check-in per habit for a date, keyed by habit id. */
export function checkinsByHabit(checkins: Checkin[], date: string): Map<string, Checkin> {
  const map = new Map<string, Checkin>();
  for (const c of checkins) if (c.date === date) map.set(c.habitId, c);
  return map;
}

/** Active habits that already existed on `date`, so newer habits are not backfilled. */
export function habitsOn(habits: Habit[], date: string): Habit[] {
  return habits.filter((h) => {
    if (!h.active) return false;
    const created = new Date(h.createdAt);
    if (Number.isNaN(created.getTime())) return true;
    return toDateKey(created) <= date;
  });
}
