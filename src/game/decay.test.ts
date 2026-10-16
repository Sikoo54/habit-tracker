import { describe, expect, it } from 'vitest';
import { applyDecay, eachDayAfter, penaltyFor } from './decay';

describe('decay', () => {
  it('penalty: 15% with 30 floor', () => {
    expect(penaltyFor(0)).toBe(30);
    expect(penaltyFor(100)).toBe(30);
    expect(penaltyFor(1000)).toBe(150);
  });

  it('eachDayAfter is exclusive on both ends', () => {
    expect(eachDayAfter('2026-09-08', '2026-09-11')).toEqual(['2026-09-09', '2026-09-10']);
    expect(eachDayAfter('2026-09-10', '2026-09-10')).toEqual([]);
  });

  it('applyDecay burns sequentially and advances ledger', () => {
    const { ledger, applied } = applyDecay({ total: 0, appliedThrough: '2026-09-08' }, 1000, [
      '2026-09-09',
      '2026-09-10',
    ]);
    expect(applied).toHaveLength(2);
    expect(applied[0]?.amount).toBe(150); // 15% of 1000
    expect(applied[1]?.amount).toBe(Math.max(30, Math.round(850 * 0.15))); // 15% of 850
    expect(ledger.total).toBe((applied[0]?.amount ?? 0) + (applied[1]?.amount ?? 0));
    expect(ledger.appliedThrough).toBe('2026-09-10');
  });

  it('never goes negative', () => {
    const { ledger } = applyDecay({ total: 0, appliedThrough: null }, 10, ['2026-09-09']);
    expect(ledger.total).toBe(30);
  });

  it('existing ledger stacks', () => {
    const { ledger } = applyDecay({ total: 100, appliedThrough: '2026-09-08' }, 500, ['2026-09-09']);
    // running = 400 -> penalty 60
    expect(ledger.total).toBe(160);
  });
});
