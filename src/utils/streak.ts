import { addDays } from './dates';

// Tolerant streak: breaks only after 2 consecutive missed days.
// One missed day still continues (tolerance) but doesn't add to the count.
//
// Example (X = done, - = missed, reference = last day of range):
//   X X - X  -> streak 4 (one miss tolerated)
//   X X - -  -> streak broken (two misses in a row)
//   Today unchecked is still OK: count back from yesterday.

/** Streak for one habit from a list of done dates (YYYY-MM-DD). */
export function calculateStreak(completedKeys: string[], referenceKey: string): number {
  const done = new Set(completedKeys);
  let streak = 0;
  let misses = 0;
  // If today isn't done yet, start from yesterday so it doesn't drop to 0.
  let cursor = done.has(referenceKey) ? referenceKey : addDays(referenceKey, -1);

  // Bound iterations so the loop always ends (e.g. 3660 days = ~10 years).
  for (let i = 0; i < 3660; i += 1) {
    if (done.has(cursor)) {
      streak += 1;
      misses = 0;
    } else {
      misses += 1;
      if (misses >= 2) break;
      // 1 miss: streak doesn't grow, but keep walking back.
    }
    cursor = addDays(cursor, -1);
    // Stop once far before the earliest date with no streak.
    if (streak === 0 && misses >= 1 && i > 4000) break;
    // Sensible stop: cursor earlier than earliest date minus 2 days.
    // (Computed below via minKey when available.)
    void 0;
  }
  // Correction: the loop above runs too far for new habits.
  // Recount bounded by the earliest date so new habits can't get giant streaks.
  if (completedKeys.length === 0) return 0;
  const sorted = [...new Set(completedKeys)].sort();
  const minKey = sorted[0] as string;
  return calculateStreakBounded(done, referenceKey, minKey);
}

function calculateStreakBounded(
  done: Set<string>,
  referenceKey: string,
  minKey: string,
): number {
  let streak = 0;
  let misses = 0;
  let cursor = done.has(referenceKey) ? referenceKey : addDays(referenceKey, -1);

  for (let i = 0; i < 3660; i += 1) {
    if (cursor < minKey) {
      // Past the habit's first day; a trailing single miss is still tolerated.
      // If misses is already 1 and cursor < minKey, stop.
      break;
    }
    if (done.has(cursor)) {
      streak += 1;
      misses = 0;
    } else {
      misses += 1;
      if (misses >= 2) break;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Friendly, blame-free encouragement. */
export function streakMessage(streak: number): string {
  if (streak <= 0) return 'Starting small today is already great. 🌱';
  if (streak === 1) return 'First step done. Keep going gently. 🌱';
  if (streak < 4) return `Small flame lit — ${streak} days running. Stick to your light version. 🔥`;
  if (streak < 8) return `Amazing — ${streak} days! One missed day is still safe. 🔥`;
  return `Consistent for ${streak} days! You are building a new identity. 🔥`;
}

/** Is the habit at risk (yesterday missed)? Gentle nudge, no judgment. */
export function isStreakAtRisk(completedKeys: string[], referenceKey: string): boolean {
  const done = new Set(completedKeys);
  if (done.has(referenceKey)) return false;
  return !done.has(addDays(referenceKey, -1));
}
