/**
 * Goal Helpers
 * Pure date formatting for goal deadlines and the star toggle, kept out of the
 * card so the wording and list updates are reusable and easy to test.
 */

import type { Goal } from '../types';
import { parseDateKey, toDateKey } from './dates';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Parses a YYYY-MM-DD key, rejecting impossible dates such as 2026-13-40. */
function readDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = parseDateKey(value);
  if (Number.isNaN(date.getTime())) return null;
  return toDateKey(date) === value ? date : null;
}

/** Compact date label such as "17 Dec 2026"; empty for a missing or bad date. */
export function formatGoalDate(targetDate: string | undefined): string {
  if (!targetDate) return '';
  const date = readDateKey(targetDate);
  if (!date) return '';
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Whole days from `today` to `targetDate`; NaN when either date is unreadable. */
export function daysUntil(targetDate: string, today: string): number {
  const target = readDateKey(targetDate);
  const base = readDateKey(today);
  if (!target || !base) return Number.NaN;
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

/** Countdown chip text; empty when there is no usable target date. */
export function goalDeadlineLabel(targetDate: string | undefined, today: string): string {
  if (!targetDate) return '';
  const days = daysUntil(targetDate, today);
  if (!Number.isFinite(days)) return '';
  if (days > 1) return `${days} days left`;
  if (days === 1) return '1 day left';
  if (days === 0) return 'Today';
  if (days === -1) return 'Passed yesterday';
  return `${Math.abs(days)} days ago`;
}

/**
 * Flips a goal's starred flag so any number of goals can be featured.
 * Returns the same array when the goal no longer exists.
 */
export function toggleGoalStar(goals: Goal[], id: string): Goal[] {
  const index = goals.findIndex((goal) => goal.id === id);
  const current = goals[index];
  if (!current) return goals;
  const next = goals.slice();
  next[index] = { ...current, starred: !current.starred };
  return next;
}
