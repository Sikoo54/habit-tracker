/**
 * Daily Streak Test Suite
 * Tests continuous daily streak counting, multi-source activity date aggregation,
 * and latest active date detection.
 */

import { describe, expect, it } from 'vitest';
import { activeDates, dailyStreak, lastActiveDate } from './dailyStreak';
import type { Checkin, Reflection, Task } from '../types';

function checkin(date: string): Checkin {
  return { id: date, habitId: 'h', date, variant: 'full', createdAt: 'x' };
}

function doneTask(date: string): Task {
  return { id: date, title: 't', done: true, priority: false, date, createdAt: 'x' };
}

function reflection(date: string): Reflection {
  return { id: date, date, wentWell: 'a', toImprove: 'b', mood: null, energy: null, createdAt: 'x', updatedAt: 'x' };
}

describe('daily streak', () => {
  it('consecutive days including today', () => {
    const d = activeDates([checkin('2026-09-08'), checkin('2026-09-09'), checkin('2026-09-10')], [], []);
    expect(dailyStreak(d, '2026-09-10')).toBe(3);
  });

  it('today empty -> count from yesterday', () => {
    const d = activeDates([checkin('2026-09-08'), checkin('2026-09-09')], [], []);
    expect(dailyStreak(d, '2026-09-10')).toBe(2);
  });

  it('one idle day breaks it (no tolerance here)', () => {
    const d = activeDates([checkin('2026-09-07'), checkin('2026-09-09'), checkin('2026-09-10')], [], []);
    expect(dailyStreak(d, '2026-09-10')).toBe(2);
  });

  it('any activity counts: tasks and reflections', () => {
    const d = activeDates([], [doneTask('2026-09-10')], [reflection('2026-09-09')]);
    expect(dailyStreak(d, '2026-09-10')).toBe(2);
  });

  it('undone tasks do not count', () => {
    const d = activeDates([], [{ ...doneTask('2026-09-10'), done: false }], []);
    expect(dailyStreak(d, '2026-09-10')).toBe(0);
  });

  it('empty -> 0, lastActive null', () => {
    const d = activeDates([], [], []);
    expect(dailyStreak(d, '2026-09-10')).toBe(0);
    expect(lastActiveDate(d)).toBeNull();
  });

  it('lastActiveDate picks max', () => {
    const d = activeDates([checkin('2026-09-01'), checkin('2026-09-10')], [], []);
    expect(lastActiveDate(d)).toBe('2026-09-10');
  });
});
