/**
 * Streak Helpers
 * The streak is a daily, whole-board measure. These helpers detect a missed
 * yesterday on one habit, decide when a streak number is worth showing, and
 * remember when the reset notice was dismissed.
 */

import { addDays } from './dates';

const STREAK_RESET_KEY = 'habittracker.v2.streakResetDismissed';

/** Date whose streak-reset notice the user already closed, if any. */
export function readStreakResetDismissed(): string | null {
  try {
    return window.localStorage.getItem(STREAK_RESET_KEY);
  } catch {
    return null;
  }
}

/** Hides the streak-reset notice for one day. Failures are non-fatal. */
export function markStreakResetDismissed(date: string): void {
  try {
    window.localStorage.setItem(STREAK_RESET_KEY, date);
  } catch {
    // Private mode / quota: the notice just stays visible.
  }
}

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
