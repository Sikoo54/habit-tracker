import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import {
  daysLeftInWeek,
  goalProgress,
  weeklyCheckinCount,
  weeklyGoalSummary,
  weeklyGoals,
} from './weeklyGoals';

function habit(id: string, weeklyGoal: number, active = true): Habit {
  return {
    id,
    name: id,
    fullVersion: 'full',
    smallVersion: 'small',
    trigger: '',
    active,
    weeklyGoal,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}_${date}`, habitId, date, variant: 'full', createdAt: date };
}

describe('weekly goals', () => {
  it('counts distinct check-in days within the week', () => {
    const checkins = [
      checkin('a', '2026-09-07'),
      checkin('a', '2026-09-08'),
      checkin('a', '2026-09-08'), // duplicate same day
      checkin('a', '2026-09-14'), // next week
    ];
    expect(weeklyCheckinCount(checkins, 'a', '2026-09-07')).toBe(2);
  });

  it('goalProgress computes rate and met', () => {
    const h = habit('a', 3);
    const c = [checkin('a', '2026-09-07'), checkin('a', '2026-09-08'), checkin('a', '2026-09-09')];
    const p = goalProgress(h, c, '2026-09-07');
    expect(p.done).toBe(3);
    expect(p.goal).toBe(3);
    expect(p.rate).toBe(1);
    expect(p.met).toBe(true);
  });

  it('rate caps at 1 when exceeding goal', () => {
    const h = habit('a', 2);
    const c = [checkin('a', '2026-09-07'), checkin('a', '2026-09-08'), checkin('a', '2026-09-09')];
    const p = goalProgress(h, c, '2026-09-07');
    expect(p.done).toBe(3);
    expect(p.rate).toBe(1);
  });

  it('weeklyGoals only includes active habits with a goal', () => {
    const habits = [habit('a', 3), habit('b', 0), habit('c', 2, false)];
    const goals = weeklyGoals(habits, [], '2026-09-07');
    expect(goals.map((g) => g.habitId)).toEqual(['a']);
  });

  it('summary counts met goals', () => {
    const habits = [habit('a', 1), habit('b', 5)];
    const c = [checkin('a', '2026-09-07'), checkin('b', '2026-09-07')];
    const s = weeklyGoalSummary(habits, c, '2026-09-07');
    expect(s.met).toBe(1);
    expect(s.total).toBe(2);
  });

  it('daysLeftInWeek counts inclusively from reference day', () => {
    expect(daysLeftInWeek('2026-09-07')).toBe(7); // Monday
    expect(daysLeftInWeek('2026-09-13')).toBe(1); // Sunday
    expect(daysLeftInWeek('2026-09-09')).toBe(5); // Wednesday
  });
});
