/**
 * Stats Utilities Test Suite
 * Tests weekly aggregated completion stats, week-over-week comparisons,
 * percentage formatting, heat levels, and annual heatmap grid structure.
 */

import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { compareWeeks, annualHeatmap, heatLevel, weeklyStats } from './stats';

function habit(id: string): Habit {
  return {
    id,
    name: id,
    fullVersion: 'full',
    trigger: '',
    active: true,
    weeklyGoal: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}_${date}`, habitId, date, createdAt: date };
}

/** Local-time ISO string, so date keys do not depend on the test timezone. */
function localIso(y: number, m: number, d: number, hour = 9): string {
  return new Date(y, m - 1, d, hour).toISOString();
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
    const w = weeklyStats(
      habits,
      [checkin('a', '2026-09-07'), checkin('b', '2026-09-07')],
      '2026-09-07',
    );
    expect(w.totalSlots).toBe(7);
    expect(w.totalDone).toBe(1);
  });

  it('counts only the habits due on each day', () => {
    const habits: Habit[] = [habit('a'), { ...habit('late'), createdAt: localIso(2026, 9, 9) }];
    const checkins = [checkin('a', '2026-09-07'), checkin('a', '2026-09-09')];
    const w = weeklyStats(habits, checkins, '2026-09-07');

    expect(w.days[0]).toMatchObject({ date: '2026-09-07', done: 1, total: 1 });
    expect(w.days[1]).toMatchObject({ date: '2026-09-08', done: 0, total: 1 });
    expect(w.days[2]).toMatchObject({ date: '2026-09-09', done: 1, total: 2 });
    // Two days with one due habit, five days with two.
    expect(w.totalSlots).toBe(12);
    expect(w.totalDone).toBe(2);
  });

  it('keeps an archived habit in the days before it left the board', () => {
    const habits: Habit[] = [{ ...habit('a'), active: false, archivedAt: localIso(2026, 9, 10) }];
    const w = weeklyStats(habits, [checkin('a', '2026-09-08')], '2026-09-07');
    expect(w.days.slice(0, 3).map((d) => d.total)).toEqual([1, 1, 1]);
    expect(w.days.slice(3).every((d) => d.total === 0)).toBe(true);
    expect(w.totalSlots).toBe(3);
    expect(w.totalDone).toBe(1);
  });

  it('no habits -> rate 0, no NaN', () => {
    const w = weeklyStats([], [], '2026-09-07');
    expect(w.rate).toBe(0);
  });

  it('compareWeeks: positive delta when this week is better', () => {
    const habits = [habit('a')];
    const checkins = [
      checkin('a', '2026-09-07'),
      checkin('a', '2026-09-08'),
      checkin('a', '2026-08-31'),
    ];
    const c = compareWeeks(habits, checkins, '2026-09-09');
    expect(c.thisWeek.rate).toBeGreaterThan(c.lastWeek.rate);
    expect(c.delta).toBeCloseTo(c.thisWeek.rate - c.lastWeek.rate);
  });
});

describe('annual heatmap', () => {
  it('heatLevel maps counts to 0..4', () => {
    expect(heatLevel(0, 4)).toBe(0);
    expect(heatLevel(1, 4)).toBe(1);
    expect(heatLevel(2, 4)).toBe(2);
    expect(heatLevel(3, 4)).toBe(3);
    expect(heatLevel(4, 4)).toBe(4);
    expect(heatLevel(2, 1)).toBe(2);
  });

  it('produces 53 full weeks of 7 cells', () => {
    const h = annualHeatmap([habit('a')], [], '2026-09-09');
    expect(h.weeks).toHaveLength(53);
    for (const w of h.weeks) expect(w.cells).toHaveLength(7);
  });

  it('marks future days and counts active days', () => {
    const habits = [habit('a'), habit('b')];
    const checkins = [
      checkin('a', '2026-09-08'),
      checkin('b', '2026-09-08'),
      checkin('a', '2026-01-05'),
    ];
    const h = annualHeatmap(habits, checkins, '2026-09-09');
    expect(h.totalActiveDays).toBe(2);
    expect(h.maxCount).toBe(2);
    const all = h.weeks.flatMap((w) => w.cells);
    const sep8 = all.find((c) => c.date === '2026-09-08');
    expect(sep8?.count).toBe(2);
    expect(sep8?.level).toBe(4);
    expect(all.some((c) => c.future)).toBe(true);
    expect(all.some((c) => c.date === '2026-09-09' && c.future)).toBe(false);
  });

  it('keeps archived habit history before the archive date', () => {
    const habits: Habit[] = [
      { ...habit('a'), active: false, archivedAt: localIso(2026, 9, 10) },
      habit('b'),
    ];
    const checkins = [
      checkin('a', '2026-09-08'),
      checkin('b', '2026-09-08'),
      checkin('a', '2026-09-10'),
    ];
    const h = annualHeatmap(habits, checkins, '2026-09-11');
    const all = h.weeks.flatMap((w) => w.cells);
    expect(all.find((c) => c.date === '2026-09-08')?.count).toBe(2);
    expect(all.find((c) => c.date === '2026-09-10')?.count).toBe(0);
    expect(h.totalActiveDays).toBe(1);
    expect(h.maxCount).toBe(2);
  });

  it('excludes inactive habits', () => {
    const habits: Habit[] = [{ ...habit('a'), active: false }, habit('b')];
    const h = annualHeatmap(
      habits,
      [checkin('a', '2026-09-08'), checkin('b', '2026-09-08')],
      '2026-09-09',
    );
    expect(h.totalActiveDays).toBe(1);
    expect(h.maxCount).toBe(1);
  });
});
