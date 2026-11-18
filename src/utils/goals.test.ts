/**
 * Goal Helper Test Suite
 * Checks deadline wording and compact date labels, including the missing and
 * malformed date paths that real backups can contain.
 */

import { describe, expect, it } from 'vitest';
import { daysUntil, formatGoalDate, goalDeadlineLabel } from './goals';

const TODAY = '2026-11-18';

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
});
