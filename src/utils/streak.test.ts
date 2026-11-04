/**
 * Streak Helper Test Suite
 * Covers the per-habit missed-yesterday signal and the threshold that decides
 * when a daily streak number is worth showing.
 */

import { describe, expect, it } from 'vitest';
import { toDateKey } from './dates';
import { isStreakAtRisk, showsStreak } from './streak';

describe('streak helpers', () => {
  it('isStreakAtRisk: yesterday missed and today open -> true', () => {
    expect(isStreakAtRisk(['2026-09-08'], '2026-09-10')).toBe(true);
  });

  it('isStreakAtRisk: today done -> false', () => {
    const k = toDateKey(new Date());
    expect(isStreakAtRisk([k], k)).toBe(false);
  });

  it('showsStreak only from 2 days up', () => {
    expect(showsStreak(0)).toBe(false);
    expect(showsStreak(1)).toBe(false);
    expect(showsStreak(2)).toBe(true);
    expect(showsStreak(9)).toBe(true);
  });
});
