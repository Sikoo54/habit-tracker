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

  it('streak achievements count consecutive full-training days', () => {
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

  it('one habit left open breaks the streak a day later', () => {
    const habits = [habit('h1'), habit('h2')];
    const checkins: Checkin[] = [
      { id: 'a', habitId: 'h1', date: '2026-09-09', variant: 'full', createdAt: 'x' },
      { id: 'b', habitId: 'h2', date: '2026-09-09', variant: 'full', createdAt: 'x' },
      { id: 'c', habitId: 'h1', date: '2026-09-10', variant: 'small', createdAt: 'x' },
      // h2 not done on the 10th
    ];
    const a = evaluateAchievements(base({ habits, checkins, todayKey: '2026-09-11' }));
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({ unlocked: false, progress: '0/3' });
  });

  it('quests and reflections no longer feed the streak', () => {
    const a = evaluateAchievements(
      base({
        habits: [habit('h')],
        tasks: [{ id: 't', title: 't', done: true, priority: false, date: '2026-09-10', createdAt: 'x' }],
        reflections: [
          { id: 'r', date: '2026-09-10', wentWell: '', toImprove: '', mood: null, energy: null, createdAt: 'x', updatedAt: 'x' },
        ],
      }),
    );
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({ unlocked: false, progress: '0/3' });
  });

  it('perfect day only needs the main quest (habits)', () => {
    const habits = [habit('h')];
    const a = evaluateAchievements(
      base({
        habits,
        // A side quest left open must not block a perfect day.
        tasks: [{ id: 't', title: 't', done: false, priority: false, date: '2026-09-10', createdAt: 'x' }],
        checkins: [{ id: 'c', habitId: 'h', date: '2026-09-10', variant: 'full', createdAt: 'x' }],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')).toMatchObject({ unlocked: true, progress: '1/1' });
  });

  it('perfect day stays locked while a habit is open', () => {
    const a = evaluateAchievements(
      base({
        habits: [habit('h1'), habit('h2')],
        checkins: [{ id: 'c', habitId: 'h1', date: '2026-09-10', variant: 'full', createdAt: 'x' }],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')).toMatchObject({ unlocked: false, progress: '1/2' });
  });

  it('Quest Runner counts every completed side quest', () => {
    const tasks = Array.from({ length: 25 }, (_, i) => ({
      id: `t${i}`,
      title: 't',
      done: true,
      priority: i % 2 === 0,
      date: '2026-09-10',
      createdAt: 'x',
    }));
    const a = evaluateAchievements(base({ tasks }));
    expect(a.find((x) => x.id === 'priority-master')).toMatchObject({ unlocked: true, progress: '25/25' });
    expect(a.find((x) => x.id === 'quest-slayer')?.unlocked).toBe(true);
  });
});
