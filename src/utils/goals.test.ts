/**
 * Goal Helper Test Suite
 * Checks deadline wording, compact date labels, and the multi-goal star toggle,
 * including the missing and malformed date paths that real backups can contain.
 */

import { describe, expect, it } from 'vitest';
import type { Goal } from '../types';
import { daysUntil, formatGoalDate, goalDeadlineLabel, toggleGoalStar } from './goals';

const TODAY = '2026-11-18';

/** Minimal stored goal for order tests. */
function goal(id: string): Goal {
  return { id, title: id, why: '', createdAt: '2026-11-18T00:00:00.000Z' };
}

describe('goal helpers', () => {
  it('formats a stored date key compactly', () => {
    expect(formatGoalDate('2026-12-31')).toBe('31 Dec 2026');
    expect(formatGoalDate('2026-01-05')).toBe('5 Jan 2026');
  });

  it('returns an empty label for missing or malformed dates', () => {
    expect(formatGoalDate(undefined)).toBe('');
    expect(formatGoalDate('')).toBe('');
    expect(formatGoalDate('soon')).toBe('');
    expect(formatGoalDate('2026-13-40')).toBe('');
  });

  it('counts whole days between two date keys', () => {
    expect(daysUntil('2026-11-18', TODAY)).toBe(0);
    expect(daysUntil('2026-11-25', TODAY)).toBe(7);
    expect(daysUntil('2026-11-17', TODAY)).toBe(-1);
  });

  it('words the countdown chip for future, today, and past dates', () => {
    expect(goalDeadlineLabel('2026-12-18', TODAY)).toBe('30 days left');
    expect(goalDeadlineLabel('2026-11-19', TODAY)).toBe('1 day left');
    expect(goalDeadlineLabel('2026-11-18', TODAY)).toBe('Today');
    expect(goalDeadlineLabel('2026-11-17', TODAY)).toBe('Passed yesterday');
    expect(goalDeadlineLabel('2026-11-08', TODAY)).toBe('10 days ago');
  });

  it('has no label without a target date', () => {
    expect(goalDeadlineLabel(undefined, TODAY)).toBe('');
    expect(goalDeadlineLabel('not-a-date', TODAY)).toBe('');
  });

  it('stars a goal without disturbing the others', () => {
    const goals = [goal('a'), goal('b'), goal('c')];
    const starred = toggleGoalStar(goals, 'b');
    expect(starred.map((g) => g.id)).toEqual(['a', 'b', 'c']);
    expect(starred.map((g) => g.starred)).toEqual([undefined, true, undefined]);
    expect(toggleGoalStar(starred, 'c').map((g) => g.starred)).toEqual([undefined, true, true]);
  });

  it('unstars a starred goal and keeps the list when the goal is gone', () => {
    const goals = [{ ...goal('a'), starred: true }, goal('b')];
    expect(toggleGoalStar(goals, 'a')[0]?.starred).toBe(false);
    expect(toggleGoalStar(goals, 'missing')).toBe(goals);
  });
});
