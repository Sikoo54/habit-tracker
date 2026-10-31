/**
 * Quote Rotation Helpers
 * Pure logic behind the daily strip: pick a stable line per calendar day and
 * step to the next one without touching storage.
 */

import { QUOTES, type Quote } from '../data/quotes';
import { parseDateKey } from '../utils/dates';

/** Stable index for a given day, so the quote only changes at midnight. */
export function quoteIndexForDate(key: string, total = QUOTES.length): number {
  if (total <= 0) return 0;
  const d = parseDateKey(key);
  const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  return ((days % total) + total) % total;
}

/** The quote for a day (deterministic). */
export function quoteForDate(key: string, quotes: Quote[] = QUOTES): Quote | null {
  if (quotes.length === 0) return null;
  return quotes[quoteIndexForDate(key, quotes.length)] ?? null;
}

/** Next quote in the list, wrapping around. */
export function nextQuote(current: number, total = QUOTES.length): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}
