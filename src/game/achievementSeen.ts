/**
 * Achievement seen-ledger.
 * Remembers which achievements the user has already been notified about, so
 * the unlock toast fires once — not on every reload.
 */

const SEEN_KEY = 'habittracker.v2.achievements.seen';

/** Stored ids, or null when the user has never been notified (first run). */
export function readSeenAchievementIds(): string[] | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

/** Persist the notification ledger. Failures are non-fatal. */
export function writeSeenAchievementIds(ids: string[]): void {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    // Private mode / quota: notification repeats are acceptable.
  }
}

/** Ids unlocked now that have never been announced. */
export function newlyUnlockedIds(currentIds: string[], seenIds: string[]): string[] {
  const seen = new Set(seenIds);
  return currentIds.filter((id) => !seen.has(id));
}
