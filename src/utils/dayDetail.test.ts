/**
 * Day Detail Test Suite
 * Covers the per-day breakdown used by the activity calendar: which habits were
 * due, quests, reflection, wake/bed times, and the XP shown for that day.
 */

import { describe, expect, it } from 'vitest';
import type { Attendance, Checkin, Habit, Reflection, Task } from '../types';
import { daySummary } from './dayDetail';

/** Local-time ISO string so date keys match the test's timezone. */
function localIso(y: number, m: number, d: number, hour = 9, minute = 0): string {
  return new Date(y, m - 1, d, hour, minute).toISOString();
}

function habit(id: string, createdAt = '2026-01-01T00:00:00.000Z'): Habit {
  return {
    id,
    name: id,
    fullVersion: 'full',
    trigger: '',
    active: true,
    weeklyGoal: 0,
    createdAt,
  };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}_${date}`, habitId, date, createdAt: date };
}

function task(id: string, date: string, done: boolean, extra: Partial<Task> = {}): Task {
  return { id, title: id, done, priority: false, date, createdAt: date, ...extra };
}

const reflection = (date: string, mood: number | null, energy: number | null): Reflection => ({
  id: `r_${date}`,
  date,
  wentWell: 'Kept the chain alive.',
  toImprove: '',
  mood,
  energy,
  createdAt: `${date}T20:00:00.000Z`,
  updatedAt: `${date}T20:00:00.000Z`,
});

describe('daySummary', () => {
  const habits = [habit('a'), habit('b'), habit('late', localIso(2026, 11, 19))];
  const checkins = [checkin('a', '2026-11-18'), checkin('b', '2026-11-19')];

  it('lists the habits due that day and which were checked', () => {
    const day = daySummary('2026-11-18', habits, checkins, [], [], []);
    expect(day.habits.map((h) => [h.id, h.done])).toEqual([
      ['a', true],
      ['b', false],
    ]);
    expect(day.habitsDone).toBe(1);
  });

  it('leaves out habits created after the day', () => {
    const day = daySummary('2026-11-18', habits, checkins, [], [], []);
    expect(day.habits.some((h) => h.id === 'late')).toBe(false);
  });

  it('keeps only that day’s quests and skips dropped ones', () => {
    const tasks = [
      task('q1', '2026-11-19', true, { priority: true }),
      task('q2', '2026-11-19', false),
      task('gone', '2026-11-19', false, { dropped: true }),
      task('other', '2026-11-18', true),
    ];
    const day = daySummary('2026-11-19', habits, checkins, tasks, [], []);
    expect(day.quests.map((q) => q.id)).toEqual(['q1', 'q2']);
    expect(day.questsDone).toBe(1);
  });

  it('reads wake and bed times from the morning and night taps', () => {
    const attendance: Attendance[] = [
      {
        date: '2026-11-19',
        morning: true,
        night: true,
        morningAt: localIso(2026, 11, 19, 5, 42),
        nightAt: localIso(2026, 11, 19, 22, 5),
      },
    ];
    const day = daySummary('2026-11-19', habits, checkins, [], [], attendance);
    expect(day.wake).toBe('05:42');
    expect(day.bed).toBe('22:05');
  });

  it('leaves the times empty for older records without stamps', () => {
    const attendance: Attendance[] = [{ date: '2026-11-19', morning: true, night: false }];
    const day = daySummary('2026-11-19', habits, checkins, [], [], attendance);
    expect(day.wake).toBe('');
    expect(day.bed).toBe('');
    expect(day.active).toBe(true);
  });

  it('adds up that day’s XP only', () => {
    const tasks = [
      task('q1', '2026-11-19', true, { priority: true }),
      task('q2', '2026-11-19', true),
    ];
    const attendance: Attendance[] = [{ date: '2026-11-19', morning: true, night: true }];
    const day = daySummary(
      '2026-11-19',
      habits,
      checkins,
      tasks,
      [reflection('2026-11-19', 4, 3), reflection('2026-11-17', 2, 2)],
      attendance,
    );
    // Checkin 20 + priority quest 25 + quest 15 + reflection 15+5 + two absen taps 10.
    expect(day.xp).toBe(90);
    expect(day.reflection).toMatchObject({ mood: 4, energy: 3 });
  });

  it('reports an empty day as inactive with no XP', () => {
    const day = daySummary('2026-11-16', habits, checkins, [], [], []);
    expect(day.active).toBe(false);
    expect(day.xp).toBe(0);
    expect(day.reflection).toBeNull();
  });
});
