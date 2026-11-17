/**
 * Habit Ordering Helpers
 * Pure functions that reorder the active habits on the daily board. Archived
 * habits keep their stored slot, and the array order itself is the saved order,
 * so no extra field or migration is needed.
 */

import type { Habit } from '../types';

/** Rebuilds the stored array with active habits following `order`. */
function withActiveOrder(habits: Habit[], order: string[]): Habit[] {
  const byId = new Map(habits.map((h) => [h.id, h]));
  const result: Habit[] = [];
  let next = 0;

  for (const habit of habits) {
    if (!habit.active) {
      result.push(habit);
      continue;
    }
    const id = order[next];
    next += 1;
    result.push((id ? byId.get(id) : undefined) ?? habit);
  }

  return result;
}

/** Active habit ids in their stored order. */
function activeIds(habits: Habit[]): string[] {
  return habits.filter((h) => h.active).map((h) => h.id);
}

/**
 * Moves one active habit a single slot up (-1) or down (1). Archived habits are
 * skipped when looking for the neighbour, so a step is always visible.
 */
export function moveHabitBy(habits: Habit[], id: string, direction: -1 | 1): Habit[] {
  const ids = activeIds(habits);
  const from = ids.indexOf(id);
  if (from < 0) return habits;

  const to = from + direction;
  const moving = ids[from];
  const neighbour = ids[to];
  if (!moving || !neighbour) return habits;

  ids[to] = moving;
  ids[from] = neighbour;
  return withActiveOrder(habits, ids);
}

/** Drops a dragged active habit into the slot of the habit it landed on. */
export function moveHabitTo(habits: Habit[], id: string, targetId: string): Habit[] {
  if (id === targetId) return habits;

  const ids = activeIds(habits);
  const from = ids.indexOf(id);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) return habits;

  ids.splice(from, 1);
  ids.splice(to, 0, id);
  return withActiveOrder(habits, ids);
}
