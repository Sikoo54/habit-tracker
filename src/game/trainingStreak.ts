/**
 * Main Quest Streak
 * A day only counts when *every* habit that existed that day was checked in.
 * One habit left open breaks the chain — this is the number shown in the HUD.
 */

import type { Checkin, Habit } from '../types';
import { habitsOn } from '../utils/checkins';
import { addDays } from '../utils/dates';
import { dailyStreak } from './dailyStreak';

/** Dates where every habit that existed on that day got a check-in. */
export function trainingDays(habits: Habit[], checkins: Checkin[]): Set<string> {
  const doneByDate = new Map<string, Set<string>>();
  for (const c of checkins) {
    const set = doneByDate.get(c.date);
    if (set) set.add(c.habitId);
    else doneByDate.set(c.date, new Set([c.habitId]));
  }

  const perfect = new Set<string>();
  for (const [date, done] of doneByDate) {
    const due = habitsOn(habits, date);
    if (due.length > 0 && due.every((h) => done.has(h.id))) perfect.add(date);
  }
  return perfect;
}

/** Consecutive fully-completed training days. Today may still be in progress. */
export function trainingStreak(habits: Habit[], checkins: Checkin[], referenceKey: string): number {
  return dailyStreak(trainingDays(habits, checkins), referenceKey);
}

/**
 * Longest run of perfect days ever recorded. Achievements read this rather
 * than the current streak, so a badge never disappears after a missed day.
 */
export function bestTrainingStreak(habits: Habit[], checkins: Checkin[]): number {
  const days = [...trainingDays(habits, checkins)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    previous = day;
  }
  return best;
}

/** A chain that ended last night, with the count it had reached. */
export interface StreakReset {
  /** Streak length before the miss. */
  lost: number;
  /** The day that was left incomplete. */
  brokenDay: string;
}

/**
 * True only the morning after a miss: yesterday was imperfect while the day
 * before was perfect. Two or more missed days are not a fresh reset, and a
 * completed today means the notice is no longer relevant.
 */
export function streakReset(
  habits: Habit[],
  checkins: Checkin[],
  todayKey: string,
): StreakReset | null {
  const perfect = trainingDays(habits, checkins);
  const yesterday = addDays(todayKey, -1);
  const dayBefore = addDays(todayKey, -2);
  if (perfect.has(yesterday) || !perfect.has(dayBefore)) return null;
  return { lost: dailyStreak(perfect, yesterday), brokenDay: yesterday };
}
