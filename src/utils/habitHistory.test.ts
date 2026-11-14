/**
 * Habit History Tests
 * Verifies the 30-day timeline marks due, done, late, missed, and archive-gap
 * days correctly for a single habit.
 */

import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { habitHistory } from './habitHistory';

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Read',
    fullVersion: '',
    trigger: '',
    active: true,
    weeklyGoal: 0,
    createdAt: new Date(2026, 9, 1, 9).toISOString(),
    ...overrides,
  };
}

function checkin(date: string, createdAt: string, habitId = 'h1'): Checkin {
  return { id: `c-${date}-${habitId}`, habitId, date, createdAt };
}

/** Local-time ISO string for a given local day/hour. */
function localIso(y: number, m: number, d: number, hour: number): string {
  return new Date(y, m - 1, d, hour).toISOString();
}

describe('habit history', () => {
  it('returns the requested window oldest first, ending today', () => {
    const result = habitHistory(habit(), [], '2026-11-10', 30);
    expect(result.days).toHaveLength(30);
    expect(result.days[0]?.date).toBe('2026-10-12');
    expect(result.days[29]?.date).toBe('2026-11-10');
    expect(result.days[29]?.isToday).toBe(true);
  });

  it('marks done, missed, and today separately', () => {
    const result = habitHistory(
      habit(),
      [
        checkin('2026-11-08', localIso(2026, 11, 8, 20)),
        checkin('2026-11-10', localIso(2026, 11, 10, 8)),
      ],
      '2026-11-10',
      3,
    );
    const byDate = new Map(result.days.map((day) => [day.date, day]));
    expect(byDate.get('2026-11-08')?.done).toBe(true);
    expect(byDate.get('2026-11-08')?.missed).toBe(false);
    expect(byDate.get('2026-11-09')?.missed).toBe(true);
    expect(byDate.get('2026-11-10')?.done).toBe(true);
    expect(byDate.get('2026-11-10')?.missed).toBe(false);
    expect(result.summary).toMatchObject({ done: 2, missed: 1, late: 0 });
  });

  it('flags a check-in written after midnight as late', () => {
    const result = habitHistory(
      habit(),
      [checkin('2026-11-08', localIso(2026, 11, 9, 1))],
      '2026-11-10',
    );
    const day = result.days.find((d) => d.date === '2026-11-08');
    expect(day?.done).toBe(true);
    expect(day?.late).toBe(true);
    expect(day?.loggedDate).toBe('2026-11-09');
    expect(result.summary.late).toBe(1);
  });

  it('does not mark today as missed', () => {
    const result = habitHistory(habit(), [], '2026-11-10');
    const today = result.days.find((d) => d.date === '2026-11-10');
    expect(today?.due).toBe(true);
    expect(today?.missed).toBe(false);
  });

  it('skips days before creation and inside an archive gap', () => {
    const result = habitHistory(
      habit({
        createdAt: localIso(2026, 11, 1, 9),
        archives: [{ from: localIso(2026, 11, 4, 12), to: localIso(2026, 11, 7, 9) }],
      }),
      [],
      '2026-11-10',
      11,
    );
    const byDate = new Map(result.days.map((day) => [day.date, day]));
    expect(byDate.get('2026-10-31')?.due).toBe(false);
    expect(byDate.get('2026-11-02')?.due).toBe(true);
    expect(byDate.get('2026-11-04')?.due).toBe(false);
    expect(byDate.get('2026-11-06')?.due).toBe(false);
    expect(byDate.get('2026-11-07')?.due).toBe(true);
    expect(result.summary.due).toBe(7);
  });

  it('ignores check-ins from other habits', () => {
    const result = habitHistory(
      habit(),
      [checkin('2026-11-08', localIso(2026, 11, 8, 20), 'other')],
      '2026-11-10',
      3,
    );
    expect(result.summary.done).toBe(0);
    expect(result.summary.missed).toBe(2);
  });

  it('rounds completion rate over due days', () => {
    const habitDays = habit();
    const result = habitHistory(
      habitDays,
      [
        checkin('2026-11-08', localIso(2026, 11, 8, 20)),
        checkin('2026-11-09', localIso(2026, 11, 9, 20)),
      ],
      '2026-11-10',
      3,
    );
    expect(result.summary.due).toBe(3);
    expect(result.summary.rate).toBe(67);
  });
});
