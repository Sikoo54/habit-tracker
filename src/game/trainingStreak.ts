/**
 * Daily Training Streak
 * A day only counts when *every* habit that existed that day was checked in.
 * One habit left open breaks the chain — this is the number shown in the HUD.
 */

import type { Checkin, Habit } from '../types';
import { habitsOn } from '../utils/checkins';
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
