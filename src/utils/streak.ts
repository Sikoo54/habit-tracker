/**
 * Streak Helpers
 * The streak is a daily, whole-board measure. These helpers only detect a missed
 * yesterday on one habit and decide when a streak number is worth showing.
 */

import { addDays } from './dates';

/** True when yesterday was missed on this habit and today is still open. */
export function isStreakAtRisk(completedKeys: string[], referenceKey: string): boolean {
  const done = new Set(completedKeys);
  if (done.has(referenceKey)) return false;
  return !done.has(addDays(referenceKey, -1));
}

/** A one-day streak is not worth a badge yet — numbers start at 2. */
export const STREAK_DISPLAY_MIN = 2;

/** Whether a streak count is big enough to show in the UI. */
export function showsStreak(streak: number): boolean {
  return streak >= STREAK_DISPLAY_MIN;
}
