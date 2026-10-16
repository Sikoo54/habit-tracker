import { describe, expect, it } from 'vitest';
import type { Checkin, Reflection, Task } from '../types';
import { creatureForLevel, levelForXp, levelProgress, nextStage, rankForLevel, totalXp, xpThreshold } from './xp';

function task(done: boolean, priority: boolean): Task {
  return { id: `${done}${priority}`, title: 't', done, priority, date: '2026-01-01', createdAt: 'x' };
}

function checkin(variant: 'full' | 'small'): Checkin {
  return { id: variant, habitId: 'h', date: '2026-01-01', variant, createdAt: 'x' };
}

describe('xp', () => {
  it('full > small, priority > other', () => {
    expect(totalXp([checkin('full')], [], [])).toBe(20);
    expect(totalXp([checkin('small')], [], [])).toBe(10);
    expect(totalXp([], [task(true, true)], [])).toBe(25);
    expect(totalXp([], [task(true, false)], [])).toBe(15);
    expect(totalXp([], [task(false, true)], [])).toBe(0);
  });

  it('reflection + bonus', () => {
    const base: Reflection = { id: 'r', date: 'd', wentWell: 'a', toImprove: 'b', mood: null, energy: null, createdAt: 'x', updatedAt: 'x' };
    expect(totalXp([], [], [base])).toBe(15);
    expect(totalXp([], [], [{ ...base, mood: 4, energy: 3 }])).toBe(20);
  });

  it('thresholds + levels', () => {
    expect(xpThreshold(1)).toBe(0);
    expect(xpThreshold(2)).toBe(100);
    expect(xpThreshold(3)).toBe(300);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(299)).toBe(2);
    expect(levelForXp(300)).toBe(3);
  });

  it('progress pct', () => {
    const p = levelProgress(150); // L2: 100..300
    expect(p.level).toBe(2);
    expect(p.current).toBe(50);
    expect(p.needed).toBe(200);
    expect(p.pct).toBe(25);
  });
});

describe('creature', () => {
  it('evolves with level, caps at final', () => {
    expect(creatureForLevel(1).emoji).toBe('🥚');
    expect(creatureForLevel(2).emoji).toBe('🌱');
    expect(creatureForLevel(7).emoji).toBe('🐉');
    expect(creatureForLevel(99).emoji).toBe('👑');
  });

  it('next stage', () => {
    expect(nextStage(1)?.level).toBe(2);
    expect(nextStage(99)).toBeNull();
  });
});

describe('ranks', () => {
  it('grinding early, consistent late, caps at top', () => {
    expect(rankForLevel(1).title).toBe('Grinder');
    expect(rankForLevel(4).title).toBe('Trailblazer');
    expect(rankForLevel(8).title).toBe('Ascendant');
    expect(rankForLevel(99).title).toBe('Ascendant');
  });
});
