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
 * Moves leftovers onto `today`. Priority quests keep their slot only while the
 * daily cap allows it — the rest become side quests instead of vanishing.
 */
export function carryOver(tasks: Task[], today: string, maxPriorities: number): Task[] {
  let prioritySlots = tasks.filter((t) => t.date === today && t.priority && !t.dropped).length;
  return tasks.map((t) => {
    if (t.done || t.dropped || t.date >= today) return t;
    const priority = t.priority && prioritySlots < maxPriorities;
    if (priority) prioritySlots += 1;
    return { ...t, date: today, priority };
  });
}

/** Flags leftovers as dropped: hidden from the UI, still recoverable from export. */
export function dropLeftovers(tasks: Task[], today: string): Task[] {
  return tasks.map((t) => (!t.done && !t.dropped && t.date < today ? { ...t, dropped: true } : t));
}
