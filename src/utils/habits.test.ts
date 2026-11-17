/**
 * Habit Ordering Test Suite
 * Verifies that active habits reorder predictably, archived habits keep their
 * stored slot, and edge moves leave the array untouched.
 */

import { describe, expect, it } from 'vitest';
import type { Habit } from '../types';
import { moveHabitBy, moveHabitTo } from './habits';

/** Minimal habit fixture with a chosen active flag. */
function habit(id: string, active = true): Habit {
  return {
    id,
    name: id,
    fullVersion: id,
    trigger: '',
    active,
    weeklyGoal: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

/** Ids in stored order, so archive slots are visible too. */
function ids(habits: Habit[]): string[] {
  return habits.map((h) => h.id);
}

describe('habit ordering', () => {
  it('moves an active habit one slot down and up', () => {
    const list = [habit('a'), habit('b'), habit('c')];
    expect(ids(moveHabitBy(list, 'a', 1))).toEqual(['b', 'a', 'c']);
    expect(ids(moveHabitBy(list, 'c', -1))).toEqual(['a', 'c', 'b']);
  });

  it('skips archived habits when stepping', () => {
    const list = [habit('a'), habit('b', false), habit('c')];
    expect(ids(moveHabitBy(list, 'a', 1))).toEqual(['c', 'b', 'a']);
    expect(ids(moveHabitBy(list, 'c', -1))).toEqual(['c', 'b', 'a']);
  });

  it('leaves the list alone at the edges and for unknown ids', () => {
    const list = [habit('a'), habit('b', false), habit('c')];
    expect(moveHabitBy(list, 'a', -1)).toBe(list);
    expect(moveHabitBy(list, 'c', 1)).toBe(list);
    expect(moveHabitBy(list, 'missing', 1)).toBe(list);
  });

  it('drops a dragged habit into the target slot', () => {
    const list = [habit('a'), habit('b'), habit('c')];
    expect(ids(moveHabitTo(list, 'a', 'c'))).toEqual(['b', 'c', 'a']);
    expect(ids(moveHabitTo(list, 'c', 'a'))).toEqual(['c', 'a', 'b']);
  });

  it('ignores self drops, archived targets, and unknown ids', () => {
    const list = [habit('a'), habit('b', false), habit('c')];
    expect(moveHabitTo(list, 'a', 'a')).toBe(list);
    expect(moveHabitTo(list, 'a', 'b')).toBe(list);
    expect(moveHabitTo(list, 'a', 'ghost')).toBe(list);
  });

  it('keeps archived habits in their stored positions', () => {
    const list = [habit('a'), habit('b', false), habit('c')];
    const moved = moveHabitTo(list, 'c', 'a');
    expect(ids(moved)).toEqual(['c', 'b', 'a']);
    expect(moved[1]).toBe(list[1]);
  });
});
