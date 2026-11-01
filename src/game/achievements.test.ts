/**
 * Achievements Test Suite
 * Validates unlock conditions and progress formatting for all game achievements
 * including first step, small wins, streak milestones, and reflections.
 */

import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { evaluateAchievements, type GameData } from './achievements';

function habit(id: string): Habit {
  return { id, name: id, fullVersion: 'f', smallVersion: 's', trigger: '', active: true, weeklyGoal: 0, createdAt: 'x' };
}

function base(over: Partial<GameData> = {}): GameData {
  return {
    habits: [],
    checkins: [],
    tasks: [],
    reflections: [],
    attendance: [],
    todayKey: '2026-09-10',
    level: 1,
    ...over,
  };
}

describe('achievements', () => {
  it('empty -> all locked', () => {
    const a = evaluateAchievements(base());
    expect(a).toHaveLength(12);
    expect(a.every((x) => !x.unlocked)).toBe(true);
  });

  it('first step + small wins', () => {
    const checkins: Checkin[] = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      habitId: 'h',
      date: '2026-09-10',
      variant: 'small' as const,
      createdAt: 'x',
    }));
    const a = evaluateAchievements(base({ checkins }));
    expect(a.find((x) => x.id === 'first-step')?.unlocked).toBe(true);
    expect(a.find((x) => x.id === 'small-wins')?.unlocked).toBe(true);
    expect(a.find((x) => x.id === 'full-power')?.unlocked).toBe(false);
  });

  it('streak achievements count consecutive active days', () => {
    const habits = [habit('h')];
    const checkins: Checkin[] = ['2026-09-08', '2026-09-09', '2026-09-10'].map((date, i) => ({
      id: `c${i}`,
      habitId: 'h',
      date,
      variant: 'full' as const,
      createdAt: 'x',
    }));
    const a = evaluateAchievements(base({ habits, checkins }));
    expect(a.find((x) => x.id === 'streak-3')?.unlocked).toBe(true);
    expect(a.find((x) => x.id === 'streak-7')?.unlocked).toBe(false);
  });

  it('streak achievements match the streak shown in the HUD', () => {
    // Different activity each day: one habit check-in, then a quest, then absen.
    // No single habit has a 3-day streak, but the climber does — so it counts.
    const a = evaluateAchievements(
      base({
        habits: [habit('h')],
        checkins: [{ id: 'c', habitId: 'h', date: '2026-09-08', variant: 'full', createdAt: 'x' }],
        tasks: [{ id: 't', title: 't', done: true, priority: false, date: '2026-09-09', createdAt: 'x' }],
        attendance: [{ date: '2026-09-10', morning: true, night: false }],
      }),
    );
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({ unlocked: true, progress: '3/3' });
  });

  it('a missed day during the streak resets the count', () => {
    const a = evaluateAchievements(
      base({
        attendance: [
          { date: '2026-09-08', morning: true, night: false },
          { date: '2026-09-10', morning: true, night: false },
        ],
      }),
    );
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({ unlocked: false, progress: '1/3' });
  });

  it('perfect day needs everything done', () => {
    const habits = [habit('h')];
    const a = evaluateAchievements(
      base({
        habits,
        tasks: [{ id: 't', title: 't', done: true, priority: true, date: '2026-09-10', createdAt: 'x' }],
        checkins: [{ id: 'c', habitId: 'h', date: '2026-09-10', variant: 'full', createdAt: 'x' }],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')?.unlocked).toBe(true);
  });
});
