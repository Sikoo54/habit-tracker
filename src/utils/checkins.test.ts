import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { checkinsByHabit, habitsOn, isLateCheckin } from './checkins';
import { toDateKey } from './dates';

function checkin(date: string, createdAt: string): Checkin {
  return { id: 'c1', habitId: 'h1', date, variant: 'full', createdAt };
}

function habit(id: string, createdAt: string, active = true): Habit {
  return { id, name: id, fullVersion: '', smallVersion: '', trigger: '', active, weeklyGoal: 0, createdAt };
}

/** Local-time ISO string for a given local day/hour. */
function localIso(y: number, m: number, d: number, hour: number): string {
  return new Date(y, m - 1, d, hour).toISOString();
}

describe('check-in timing', () => {
  it('is on time when written the same local day', () => {
    const c = checkin('2026-11-01', localIso(2026, 11, 1, 21));
    expect(isLateCheckin(c)).toBe(false);
  });

  it('is late when written after midnight', () => {
    const c = checkin('2026-11-01', localIso(2026, 11, 2, 1));
    expect(isLateCheckin(c)).toBe(true);
  });

  it('does not flag unparseable timestamps', () => {
    expect(isLateCheckin(checkin('2026-11-01', 'garbage'))).toBe(false);
  });

  it('keeps one check-in per habit for a date', () => {
    const map = checkinsByHabit(
      [
        { ...checkin('2026-11-01', 'x'), id: 'a', habitId: 'h1' },
        { ...checkin('2026-11-01', 'x'), id: 'b', habitId: 'h2' },
        { ...checkin('2026-10-31', 'x'), id: 'c', habitId: 'h1' },
      ],
      '2026-11-01',
    );
    expect([...map.keys()].sort()).toEqual(['h1', 'h2']);
  });
});

describe('habits available for a date', () => {
  const habits = [
    habit('old', localIso(2026, 10, 1, 9)),
    habit('same-day', localIso(2026, 11, 1, 9)),
    habit('tomorrow', localIso(2026, 11, 2, 9)),
    habit('archived', localIso(2026, 10, 1, 9), false),
  ];

  it('includes habits created on or before the date', () => {
    expect(habitsOn(habits, '2026-11-01').map((h) => h.id)).toEqual(['old', 'same-day']);
  });

  it('drops inactive habits', () => {
    expect(habitsOn(habits, '2026-11-01').some((h) => h.id === 'archived')).toBe(false);
  });

  it('matches the created day key exactly', () => {
    expect(toDateKey(new Date(habits[1]?.createdAt ?? ''))).toBe('2026-11-01');
  });
});
