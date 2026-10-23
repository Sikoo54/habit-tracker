import { addDays } from './dates';

// Strict streak: one missed day resets the count to 0.
// Today not yet checked is still fine (we count back from yesterday).
//
// Example (X = done, - = missed, reference = last day of range):
//   X X X X  -> streak 4
//   X X - X  -> streak 1 (the gap resets it)
//   Today unchecked is OK: count back from yesterday.

/** Streak for one habit from a list of done dates (YYYY-MM-DD). */
export function calculateStreak(completedKeys: string[], referenceKey: string): number {
  if (completedKeys.length === 0) return 0;
  const done = new Set(completedKeys);
  // If today isn't done yet, start from yesterday so it doesn't drop early.
  let cursor = done.has(referenceKey) ? referenceKey : addDays(referenceKey, -1);
  let streak = 0;
  // Bound iterations so the loop always ends (e.g. 3660 days = ~10 years).
  for (let i = 0; i < 3660; i += 1) {
    if (!done.has(cursor)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Friendly, blame-free encouragement. */
export function streakMessage(streak: number): string {
  if (streak <= 0) return 'Starting small today is already great. 🌱';
  if (streak === 1) return 'First step done. Keep going gently. 🌱';
  if (streak < 4) return `Small flame lit — ${streak} days running. Stick to your light version. 🔥`;
  if (streak < 8) return `Amazing — ${streak} days! Keep the flame alive today. 🔥`;
  return `Consistent for ${streak} days! You are building a new identity. 🔥`;
}

/** True when the streak already broke (yesterday missed) and today is still open. */
export function isStreakAtRisk(completedKeys: string[], referenceKey: string): boolean {
  const done = new Set(completedKeys);
  if (done.has(referenceKey)) return false;
  return !done.has(addDays(referenceKey, -1));
}
