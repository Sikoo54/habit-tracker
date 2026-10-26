import { describe, expect, it } from 'vitest';
import { QUOTES } from '../data/quotes';
import { nextQuote, quoteForDate, quoteIndexForDate } from './quote';

describe('daily quote', () => {
  it('is deterministic for the same day', () => {
    expect(quoteIndexForDate('2026-10-26')).toBe(quoteIndexForDate('2026-10-26'));
  });

  it('stays within range', () => {
    for (let i = 0; i < 400; i += 1) {
      const key = `2026-01-${String((i % 28) + 1).padStart(2, '0')}`;
      const idx = quoteIndexForDate(key);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(QUOTES.length);
    }
  });

  it('changes from one day to the next', () => {
    expect(quoteIndexForDate('2026-10-26')).not.toBe(quoteIndexForDate('2026-10-27'));
  });

  it('returns a quote object', () => {
    const q = quoteForDate('2026-10-26');
    expect(q).not.toBeNull();
    expect(typeof q?.text).toBe('string');
  });

  it('handles empty list', () => {
    expect(quoteForDate('2026-10-26', [])).toBeNull();
    expect(quoteIndexForDate('2026-10-26', 0)).toBe(0);
  });

  it('nextQuote wraps around', () => {
    expect(nextQuote(QUOTES.length - 1)).toBe(0);
    expect(nextQuote(0)).toBe(1);
  });

  it('all quotes have text', () => {
    for (const q of QUOTES) expect(q.text.trim().length).toBeGreaterThan(0);
  });
});
