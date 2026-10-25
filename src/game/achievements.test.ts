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
  return { habits: [], checkins: [], tasks: [], reflections: [], todayKey: '2026-09-10', level: 1, ...over };
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

  it('streak achievements via tolerant streak', () => {
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
