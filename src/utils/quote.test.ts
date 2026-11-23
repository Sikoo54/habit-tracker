/**
 * Daily Quote Test Suite
 * Checks the deterministic day-to-index mapping and wrap-around behavior.
 */

import { describe, expect, it } from 'vitest';
import { DEFAULT_QUOTES } from '../data/quotes';
import type { Quote } from '../types';
import { nextQuote, quoteForDate, quoteIndexForDate } from './quote';

/** Minimal stored quote fixture. */
function quote(id: string): Quote {
  return { id, text: id, author: null, createdAt: '2026-01-01T00:00:00.000Z' };
}

const QUOTES = [quote('a'), quote('b'), quote('c')];

describe('daily quote', () => {
  it('is deterministic for the same day', () => {
    expect(quoteIndexForDate('2026-10-26', QUOTES.length)).toBe(
      quoteIndexForDate('2026-10-26', QUOTES.length),
    );
  });

  it('stays within range', () => {
    for (let i = 0; i < 400; i += 1) {
      const key = `2026-01-${String((i % 28) + 1).padStart(2, '0')}`;
      const idx = quoteIndexForDate(key, QUOTES.length);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(QUOTES.length);
    }
  });

  it('changes from one day to the next', () => {
    expect(quoteIndexForDate('2026-10-26', QUOTES.length)).not.toBe(
      quoteIndexForDate('2026-10-27', QUOTES.length),
    );
  });

  it('returns a quote object from the supplied list', () => {
    const q = quoteForDate('2026-10-26', QUOTES);
    expect(q).not.toBeNull();
    expect(QUOTES.map((item) => item.id)).toContain(q?.id);
  });

  it('handles empty list', () => {
    expect(quoteForDate('2026-10-26', [])).toBeNull();
    expect(quoteIndexForDate('2026-10-26', 0)).toBe(0);
  });

  it('nextQuote wraps around', () => {
    expect(nextQuote(QUOTES.length - 1, QUOTES.length)).toBe(0);
    expect(nextQuote(0, QUOTES.length)).toBe(1);
  });

  it('all starter quotes have text', () => {
    for (const q of DEFAULT_QUOTES) expect(q.text.trim().length).toBeGreaterThan(0);
  });
});
