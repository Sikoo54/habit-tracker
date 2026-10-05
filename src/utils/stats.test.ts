import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { compareWeeks, weeklyStats } from './stats';

function habit(id: string): Habit {
  return {
    id,
    name: id,
    fullVersion: 'full',
    smallVersion: 'small',
    trigger: '',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}_${date}`, habitId, date, variant: 'full', createdAt: date };
}

describe('weekly stats', () => {
  it('full-week rate with 2 habits', () => {
    const habits = [habit('a'), habit('b')];
    const monday = '2026-09-07'; // Monday
    const checkins: Checkin[] = [];
    for (let i = 0; i < 7; i += 1) {
      const d = `2026-09-${String(7 + i).padStart(2, '0')}`;
      checkins.push(checkin('a', d));
      if (i < 3) checkins.push(checkin('b', d));
    }
    const w = weeklyStats(habits, checkins, monday);
    expect(w.totalSlots).toBe(14);
    expect(w.totalDone).toBe(10);
    expect(w.rate).toBeCloseTo(10 / 14);
    expect(w.days).toHaveLength(7);
  });

  it('inactive habits excluded', () => {
    const habits: Habit[] = [{ ...habit('a'), active: false }, habit('b')];
    const w = weeklyStats(habits, [checkin('a', '2026-09-07'), checkin('b', '2026-09-07')], '2026-09-07');
    expect(w.totalSlots).toBe(7);
    expect(w.totalDone).toBe(1);
  });

  it('no habits -> rate 0, no NaN', () => {
    const w = weeklyStats([], [], '2026-09-07');
    expect(w.rate).toBe(0);
  });

  it('compareWeeks: positive delta when this week is better', () => {
    const habits = [habit('a')];
    const checkins = [checkin('a', '2026-09-07'), checkin('a', '2026-09-08'), checkin('a', '2026-08-31')];
    const c = compareWeeks(habits, checkins, '2026-09-09');
    expect(c.thisWeek.rate).toBeGreaterThan(c.lastWeek.rate);
    expect(c.delta).toBeCloseTo(c.thisWeek.rate - c.lastWeek.rate);
  });
});
