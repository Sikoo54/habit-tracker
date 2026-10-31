/**
 * Frost Decay (XP Penalty) System
 * Enforces habit momentum by deducting a percentage of net XP for idle days,
 * tracking applied penalties in a ledger.
 */

import { addDays } from '../utils/dates';

// Frost decay: every fully idle day (no check-in, no done task, no reflection)
// burns XP. Enough frost can drop you a level. Harsh on purpose —
// the mountain does not wait.

/** Persistent ledger of applied frost decay penalties */
export interface DecayLedger {
  total: number; // XP burned so far
  appliedThrough: string | null; // last fully-processed date (YYYY-MM-DD)
}

/** Record of a penalty applied to a specific missed day */
export interface AppliedPenalty {
  date: string; // the idle day
  amount: number; // XP burned for it
}

/** Fraction of net XP burned per fully idle day. */
export const DECAY_RATE = 0.15;
/** Floor so short streaks still feel a missed day. */
export const MIN_PENALTY = 30;
/** Forgive ancient history on first run: only the last N idle days count. */
export const MAX_CATCHUP_DAYS = 3;

/** Calculates XP penalty amount for an idle day based on current net XP */
export function penaltyFor(netXp: number): number {
  return Math.max(MIN_PENALTY, Math.round(netXp * DECAY_RATE));
}

/** Dates strictly inside (fromExclusive, toExclusive). */
export function eachDayAfter(fromExclusive: string, toExclusive: string): string[] {
  const out: string[] = [];
  let c = addDays(fromExclusive, 1);
  for (let i = 0; i < 3660 && c < toExclusive; i += 1) {
    out.push(c);
    c = addDays(c, 1);
  }
  return out;
}

/** Burn XP day by day, sequentially (each penalty shrinks the next base). */
export function applyDecay(
  ledger: DecayLedger,
  grossXp: number,
  missed: string[],
): { ledger: DecayLedger; applied: AppliedPenalty[] } {
  let running = Math.max(0, grossXp - ledger.total);
  let total = ledger.total;
  const applied: AppliedPenalty[] = [];
  let last = ledger.appliedThrough;
  for (const date of missed) {
    const amount = penaltyFor(running);
    running = Math.max(0, running - amount);
    total += amount;
    applied.push({ date, amount });
    last = date;
  }
  return { ledger: { total, appliedThrough: last }, applied };
}
