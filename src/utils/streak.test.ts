import { describe, expect, it } from 'vitest';
import { addDays, toDateKey } from './dates';
import { calculateStreak, isStreakAtRisk } from './streak';

function range(endKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(endKey, -(count - 1 - i)));
}

describe('tolerant streak', () => {
  it('full streak with no misses', () => {
    const ref = '2026-09-10';
    expect(calculateStreak(range(ref, 5), ref)).toBe(5);
  });

  it('1 missed day still continues', () => {
    const ref = '2026-09-10';
    const keys = range(ref, 5).filter((k) => k !== '2026-09-08');
    // 06,07,09,10 (+missed 08) -> streak 4
    expect(calculateStreak(keys, ref)).toBe(4);
  });

  it('2 consecutive missed days break the streak', () => {
    const ref = '2026-09-10';
    const keys = ['2026-09-01', '2026-09-02', '2026-09-09', '2026-09-10'];
    // Back from 10: 10,09 ok, then 08,07 two misses -> broken. Streak = 2.
    expect(calculateStreak(keys, ref)).toBe(2);
  });

  it('empty -> 0', () => {
    expect(calculateStreak([], '2026-09-10')).toBe(0);
  });

  it('month boundary (Jan 31 -> Feb 1) still connects', () => {
    const ref = '2026-02-01';
    const keys = ['2026-01-30', '2026-01-31', '2026-02-01'];
    expect(calculateStreak(keys, ref)).toBe(3);
  });

  it('month boundary with 1 miss still tolerated', () => {
    // Jan 30, (Jan 31 missed), Feb 1, Feb 2
    const keys = ['2026-01-30', '2026-02-01', '2026-02-02'];
    expect(calculateStreak(keys, '2026-02-02')).toBe(3);
  });

  it('today unchecked: count from yesterday', () => {
    const keys = ['2026-09-08', '2026-09-09'];
    expect(calculateStreak(keys, '2026-09-10')).toBe(2);
  });

  it('isStreakAtRisk: yesterday missed and today open -> true', () => {
    expect(isStreakAtRisk(['2026-09-08'], '2026-09-10')).toBe(true);
  });

  it('isStreakAtRisk: today done -> false', () => {
    const k = toDateKey(new Date());
    expect(isStreakAtRisk([k], k)).toBe(false);
  });
});
