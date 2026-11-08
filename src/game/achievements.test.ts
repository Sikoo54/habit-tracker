/**
 * Achievements Test Suite
 * Verifies permanent unlock conditions: habit volume, best-ever streaks,
 * perfect weeks, side quests, reflections, attendance, and rank progression.
 */

import { describe, expect, it } from 'vitest';
import type { Checkin, Habit, Reflection, Task } from '../types';
import { evaluateAchievements, type GameData } from './achievements';

function habit(id: string, createdAt = '2026-09-01T00:00:00.000Z', active = true): Habit {
  return { id, name: id, fullVersion: 'f', trigger: '', active, weeklyGoal: 0, createdAt };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}-${date}`, habitId, date, createdAt: 'x' };
}

function reflection(
  date: string,
  mood: number | null = null,
  energy: number | null = null,
): Reflection {
  return {
    id: `r-${date}`,
    date,
    wentWell: '',
    toImprove: '',
    mood,
    energy,
    createdAt: 'x',
    updatedAt: 'x',
  };
}

function base(over: Partial<GameData> = {}): GameData {
  return {
    habits: [],
    checkins: [],
    tasks: [],
    reflections: [],
    attendance: [],
    grossXp: 0,
    ...over,
  };
}

const H1 = habit('h1');

describe('achievements', () => {
  it('empty -> all locked, with unique ids and valid metadata', () => {
    const a = evaluateAchievements(base());
    expect(a).toHaveLength(17);
    expect(a.every((x) => !x.unlocked)).toBe(true);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    expect(a.every((x) => x.target > 0 && x.current >= 0)).toBe(true);
  });

  it('first step unlocks, then the check-in badges climb', () => {
    const many = (n: number): Checkin[] =>
      Array.from({ length: n }, (_, i) =>
        checkin('h', `2026-09-${String((i % 28) + 1).padStart(2, '0')}`),
      );
    const ten = evaluateAchievements(base({ checkins: many(10) }));
    expect(ten.find((x) => x.id === 'first-step')?.unlocked).toBe(true);
    expect(ten.find((x) => x.id === 'habit-devotee')).toMatchObject({
      unlocked: false,
      progress: '10/25',
    });
    expect(ten.find((x) => x.id === 'iron-routine')?.unlocked).toBe(false);

    const fifty = evaluateAchievements(base({ checkins: many(50) }));
    expect(fifty.find((x) => x.id === 'habit-devotee')?.unlocked).toBe(true);
    expect(fifty.find((x) => x.id === 'iron-routine')).toMatchObject({
      unlocked: true,
      progress: '50/50',
    });
  });

  it('streak badges use the best run ever, not the current one', () => {
    const habits = [H1];
    const checkins = ['2026-09-08', '2026-09-09', '2026-09-10'].map((date) => checkin('h1', date));
    // The 11th is missing: the current streak is 0, the best run is still 3.
    const a = evaluateAchievements(base({ habits, checkins }));
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({
      unlocked: true,
      progress: '3/3',
    });
    expect(a.find((x) => x.id === 'streak-7')).toMatchObject({
      unlocked: false,
      progress: '3/7',
    });
  });

  it('Unstoppable unlocks at seven perfect days in a row', () => {
    const days = [
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
    ];
    const checkins = days.map((date) => checkin('h1', date));
    const a = evaluateAchievements(base({ habits: [H1], checkins }));
    expect(a.find((x) => x.id === 'streak-7')).toMatchObject({
      unlocked: true,
      progress: '7/7',
    });
  });

  it('Perfect Day stays unlocked after a later imperfect day', () => {
    const a = evaluateAchievements(
      base({
        habits: [H1],
        // Yesterday was a full board; today has no check-ins at all.
        checkins: [checkin('h1', '2026-09-09')],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')).toMatchObject({
      unlocked: true,
      progress: '1/1',
    });
  });

  it('Week Warrior needs five perfect days in one Monday–Sunday week', () => {
    const four = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'].map((date) =>
      checkin('h1', date),
    );
    const locked = evaluateAchievements(base({ habits: [H1], checkins: four }));
    expect(locked.find((x) => x.id === 'week-warrior')).toMatchObject({
      unlocked: false,
      progress: '4/5',
    });

    const five = [...four, checkin('h1', '2026-09-11')];
    const unlocked = evaluateAchievements(base({ habits: [H1], checkins: five }));
    expect(unlocked.find((x) => x.id === 'week-warrior')).toMatchObject({
      unlocked: true,
      progress: '5/5',
    });
  });

  it('one habit left open breaks the streak a day later', () => {
    const habits = [habit('h1'), habit('h2')];
    const checkins: Checkin[] = [
      checkin('h1', '2026-09-09'),
      checkin('h2', '2026-09-09'),
      checkin('h1', '2026-09-10'),
      // h2 not done on the 10th
    ];
    const a = evaluateAchievements(base({ habits, checkins }));
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({
      unlocked: false,
      progress: '1/3',
    });
  });

  it('quests and reflections no longer feed the streak', () => {
    const tasks: Task[] = [
      { id: 't', title: 't', done: true, priority: false, date: '2026-09-10', createdAt: 'x' },
    ];
    const a = evaluateAchievements(
      base({
        habits: [H1],
        tasks,
        reflections: [reflection('2026-09-10')],
      }),
    );
    expect(a.find((x) => x.id === 'streak-3')).toMatchObject({
      unlocked: false,
      progress: '0/3',
    });
  });

  it('perfect day only needs the main quest (habits)', () => {
    const a = evaluateAchievements(
      base({
        habits: [H1],
        // A side quest left open must not block a perfect day.
        tasks: [
          { id: 't', title: 't', done: false, priority: false, date: '2026-09-10', createdAt: 'x' },
        ],
        checkins: [checkin('h1', '2026-09-10')],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')).toMatchObject({
      unlocked: true,
      progress: '1/1',
    });
  });

  it('perfect day stays locked while a habit is open', () => {
    const a = evaluateAchievements(
      base({
        habits: [habit('h1'), habit('h2')],
        checkins: [checkin('h1', '2026-09-10')],
      }),
    );
    expect(a.find((x) => x.id === 'perfect-day')).toMatchObject({
      unlocked: false,
      progress: '0/1',
    });
  });

  it('side quest counts unlock Slayer, Runner, then Questmaster', () => {
    const tasks = (n: number): Task[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `t${i}`,
        title: 't',
        done: true,
        priority: false,
        date: '2026-09-10',
        createdAt: 'x',
      }));

    const twentyFive = evaluateAchievements(base({ tasks: tasks(25) }));
    expect(twentyFive.find((x) => x.id === 'quest-slayer')?.unlocked).toBe(true);
    expect(twentyFive.find((x) => x.id === 'priority-master')).toMatchObject({
      unlocked: true,
      progress: '25/25',
    });
    expect(twentyFive.find((x) => x.id === 'questmaster')?.unlocked).toBe(false);

    const fifty = evaluateAchievements(base({ tasks: tasks(50) }));
    expect(fifty.find((x) => x.id === 'questmaster')).toMatchObject({
      unlocked: true,
      progress: '50/50',
    });
  });

  it('reflection badges count entries and mood+energy days', () => {
    const fourMood = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'].map((date) =>
      reflection(date, 4, 3),
    );
    const locked = evaluateAchievements(base({ reflections: fourMood }));
    expect(locked.find((x) => x.id === 'night-owl')?.unlocked).toBe(true);
    expect(locked.find((x) => x.id === 'mindful')?.unlocked).toBe(true);
    expect(locked.find((x) => x.id === 'in-tune')).toMatchObject({
      unlocked: false,
      progress: '4/5',
    });

    const fiveMood = [...fourMood, reflection('2026-09-11', 5, 4)];
    const unlocked = evaluateAchievements(base({ reflections: fiveMood }));
    expect(unlocked.find((x) => x.id === 'in-tune')).toMatchObject({
      unlocked: true,
      progress: '5/5',
    });
  });

  it('attendance badges count morning and night separately', () => {
    const mornings = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      morning: true,
      night: false,
    }));
    const a = evaluateAchievements(base({ attendance: mornings }));
    expect(a.find((x) => x.id === 'early-riser')).toMatchObject({
      unlocked: true,
      progress: '10/10',
    });
    expect(a.find((x) => x.id === 'night-watch')).toMatchObject({
      unlocked: false,
      progress: '0/10',
    });
  });

  it('Ascension reads gross XP, so frost decay cannot relock it', () => {
    const locked = evaluateAchievements(base({ grossXp: 99 }));
    expect(locked.find((x) => x.id === 'evolving')).toMatchObject({
      unlocked: false,
      progress: '0/1',
    });

    const unlocked = evaluateAchievements(base({ grossXp: 100 }));
    expect(unlocked.find((x) => x.id === 'evolving')).toMatchObject({
      unlocked: true,
      progress: '1/1',
    });
  });
});
