/**
 * Task Carry-Over Helpers
 * Pure functions behind the leftover-quest banner: which quests were left open,
 * what carrying them over looks like, and how letting go is stored.
 */

import type { Task } from '../types';

/** Unfinished quests from earlier days, oldest first. Dropped ones stay hidden. */
export function leftoversOf(tasks: Task[], today: string): Task[] {
  return tasks
    .filter((t) => !t.done && !t.dropped && t.date < today)
    .sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date < b.date ? -1 : 1));
}

/**
 * Moves leftovers onto `today` as side quests. Legacy priority flags are
 * cleared so the merged list stays uniform.
 */
export function carryOver(tasks: Task[], today: string): Task[] {
  return tasks.map((t) => {
    if (t.done || t.dropped || t.date >= today) return t;
    return { ...t, date: today, priority: false };
  });
}

/** Flags leftovers as dropped: hidden from the UI, still recoverable from export. */
export function dropLeftovers(tasks: Task[], today: string): Task[] {
  return tasks.map((t) => (!t.done && !t.dropped && t.date < today ? { ...t, dropped: true } : t));
}
