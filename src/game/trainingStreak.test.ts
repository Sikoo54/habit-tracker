import { describe, expect, it } from 'vitest';
import type { Checkin, Habit } from '../types';
import { trainingDays, streakReset, trainingStreak } from './trainingStreak';

function habit(id: string, createdAt = '2026-09-01T00:00:00.000Z', active = true): Habit {
  return { id, name: id, fullVersion: 'f', trigger: '', active, weeklyGoal: 0, createdAt };
}

function checkin(habitId: string, date: string): Checkin {
  return { id: `${habitId}-${date}`, habitId, date, createdAt: 'x' };
}

const H1 = habit('h1');
const H2 = habit('h2');

describe('training days', () => {
  it('counts a day only when every habit is done', () => {
    const days = trainingDays(
      [H1, H2],
      [checkin('h1', '2026-09-09'), checkin('h2', '2026-09-09'), checkin('h1', '2026-09-10')],
    );
    expect([...days]).toEqual(['2026-09-09']);
  });

  it('ignores quests and reflections — only training counts', () => {
    expect(trainingDays([H1], [])).toEqual(new Set());
  });

  it('does not let a habit created later break an earlier day', () => {
    const newer = habit('h3', '2026-09-10T09:00:00.000Z');
    const days = trainingDays(
      [H1, newer],
      [checkin('h1', '2026-09-09'), checkin('h1', '2026-09-10'), checkin('h3', '2026-09-10')],
    );
    expect(days.has('2026-09-09')).toBe(true);
    expect(days.has('2026-09-10')).toBe(true);
  });

  it('skips archived habits', () => {
    const archived = habit('h2', '2026-09-01T00:00:00.000Z', false);
    const days = trainingDays([H1, archived], [checkin('h1', '2026-09-09')]);
    expect(days.has('2026-09-09')).toBe(true);
  });

  it('returns nothing when there are no habits', () => {
    expect(trainingDays([], [checkin('h1', '2026-09-09')])).toEqual(new Set());
  });
});

describe('training streak', () => {
  it('counts consecutive perfect days', () => {
    const checkins = ['2026-09-08', '2026-09-09', '2026-09-10'].map((d) => checkin('h1', d));
    expect(trainingStreak([H1], checkins, '2026-09-10')).toBe(3);
  });

  it('keeps yesterday alive while today is unfinished', () => {
    const checkins = ['2026-09-08', '2026-09-09'].map((d) => checkin('h1', d));
    expect(trainingStreak([H1], checkins, '2026-09-10')).toBe(2);
  });

  it('an unfinished today is still in progress, not a break', () => {
    const checkins = [
      checkin('h1', '2026-09-09'),
      checkin('h2', '2026-09-09'),
      checkin('h1', '2026-09-10'),
      // h2 still open today
    ];
    expect(trainingStreak([H1, H2], checkins, '2026-09-10')).toBe(1);
  });

  it('breaks the chain once the incomplete day is in the past', () => {
    const checkins = [
      checkin('h1', '2026-09-09'),
      checkin('h2', '2026-09-09'),
      checkin('h1', '2026-09-10'),
      // h2 left open on the 10th
    ];
    expect(trainingStreak([H1, H2], checkins, '2026-09-11')).toBe(0);
  });

  it('a gap resets the count', () => {
    const checkins = ['2026-09-07', '2026-09-09', '2026-09-10'].map((d) => checkin('h1', d));
    expect(trainingStreak([H1], checkins, '2026-09-10')).toBe(2);
  });
});

describe('streak reset notice', () => {
  it('reports the lost chain the morning after a miss', () => {
    const checkins = ['2026-09-07', '2026-09-08', '2026-09-09'].map((d) => checkin('h1', d));
    // Today is the 11th: the 10th was missed, the 9th closed a 3-day chain.
    expect(streakReset([H1], checkins, '2026-09-11')).toEqual({ lost: 3, brokenDay: '2026-09-10' });
  });

  it('says nothing when yesterday was complete', () => {
    const checkins = ['2026-09-09', '2026-09-10'].map((d) => checkin('h1', d));
    expect(streakReset([H1], checkins, '2026-09-11')).toBeNull();
  });

  it('does not repeat after two missed days', () => {
    const checkins = ['2026-09-07', '2026-09-08'].map((d) => checkin('h1', d));
    expect(streakReset([H1], checkins, '2026-09-11')).toBeNull();
  });

  it('ignores a day with no habits', () => {
    expect(streakReset([], [], '2026-09-11')).toBeNull();
  });
});
