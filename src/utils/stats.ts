/**
 * Statistics & Activity Heatmap Engine
 * Aggregates weekly completion performance, compares week-over-week trends,
 * and generates 52-week activity heatmap grids (GitHub-style).
 */

import type { Checkin, Habit } from '../types';
import { habitsOn } from './checkins';
import { addDays, parseDateKey, startOfWeekMonday, weekKeys } from './dates';

/** Daily completion statistics */
export interface DayStat {
  date: string;
  done: number;
  total: number;
  rate: number; // 0..1
}

/** Weekly aggregate statistics */
export interface WeekStat {
  monday: string;
  days: DayStat[];
  totalDone: number;
  totalSlots: number;
  rate: number; // 0..1
}

/** One week of stats (Monday–Sunday), counting the habits due each day. */
export function weeklyStats(habits: Habit[], checkins: Checkin[], mondayKey: string): WeekStat {
  const days = weekKeys(mondayKey);
  const byDay = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (!byDay.has(c.date)) byDay.set(c.date, new Set());
    byDay.get(c.date)?.add(c.habitId);
  }
  const dayStats: DayStat[] = days.map((date) => {
    // A habit added mid-week was not due on the earlier days; an archived one
    // still was. Using the live active count made both totals lie.
    const dueIds = new Set(habitsOn(habits, date).map((h) => h.id));
    const doneSet = byDay.get(date);
    const done = doneSet ? [...doneSet].filter((id) => dueIds.has(id)).length : 0;
    const total = dueIds.size;
    return {
      date,
      done: Math.min(done, total),
      total,
      rate: total === 0 ? 0 : Math.min(done, total) / total,
    };
  });
  const totalDone = dayStats.reduce((s, d) => s + d.done, 0);
  const totalSlots = dayStats.reduce((s, d) => s + d.total, 0);
  return {
    monday: mondayKey,
    days: dayStats,
    totalDone,
    totalSlots,
    rate: totalSlots === 0 ? 0 : totalDone / totalSlots,
  };
}

/** Week-over-week comparison payload */
export interface WeekCompare {
  thisWeek: WeekStat;
  lastWeek: WeekStat;
  delta: number; // selisih rate (-1..1)
}

/** This week vs last week. */
export function compareWeeks(
  habits: Habit[],
  checkins: Checkin[],
  referenceKey: string,
): WeekCompare {
  const monday = startOfWeekMonday(referenceKey);
  const lastMonday = addDays(monday, -7);
  const thisWeek = weeklyStats(habits, checkins, monday);
  const lastWeek = weeklyStats(habits, checkins, lastMonday);
  return { thisWeek, lastWeek, delta: thisWeek.rate - lastWeek.rate };
}

/** Formats a 0..1 rate into a rounded percentage string */
export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/** Heatmap grid cell definition */
export interface HeatCell {
  date: string;
  count: number;
  /** Habits that were due that day, used for "2 of 3" labels. */
  total: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

/** Heatmap column representing one full week */
export interface HeatWeek {
  cells: HeatCell[];
}

/** Full annual activity heatmap dataset */
export interface AnnualHeatmap {
  weeks: HeatWeek[];
  monthLabels: { index: number; label: string }[];
  maxCount: number;
  totalActiveDays: number;
}

const MONTH_SHORT = [
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

/** Map a day's completed count to one of 4 intensity levels. */
export function heatLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 2;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * GitHub-style heatmap: full weeks (Mon..Sun) covering roughly the last year,
 * ending on the week that contains `referenceKey`. Intensity is the number of
 * distinct habits completed that day.
 */
export function annualHeatmap(
  habits: Habit[],
  checkins: Checkin[],
  referenceKey: string,
  weeksBack = 52,
): AnnualHeatmap {
  const byDay = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (!byDay.has(c.date)) byDay.set(c.date, new Set());
    byDay.get(c.date)?.add(c.habitId);
  }

  const endMonday = startOfWeekMonday(referenceKey);
  const startMonday = addDays(endMonday, -7 * weeksBack);

  const today = referenceKey;

  const weeks: HeatWeek[] = [];
  const seenMonths = new Set<string>();
  const monthLabels: { index: number; label: string }[] = [];
  let maxCount = 0;
  let totalActiveDays = 0;

  for (let w = 0; w <= weeksBack; w += 1) {
    const monday = addDays(startMonday, w * 7);

    const cells: HeatCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(monday, d);
      // Archived habits keep their past cells; new habits do not retroactively
      // light up days before they existed.
      const dueIds = new Set(habitsOn(habits, date).map((h) => h.id));
      const doneSet = byDay.get(date);
      const count = doneSet ? [...doneSet].filter((id) => dueIds.has(id)).length : 0;
      if (count > 0) totalActiveDays += 1;
      if (count > maxCount) maxCount = count;
      cells.push({ date, count, total: dueIds.size, level: 0, future: date > today });
    }

    // Month label on the first week whose Monday starts a new month.
    const md = parseDateKey(monday);
    const monthKey = `${md.getFullYear()}-${md.getMonth()}`;
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      monthLabels.push({ index: w, label: MONTH_SHORT[md.getMonth()] ?? '' });
    }

    weeks.push({ cells });
  }

  // Intensity needs the global max, so levels are assigned after the grid is built.
  for (const week of weeks) {
    for (const cell of week.cells) cell.level = heatLevel(cell.count, maxCount);
  }

  return { weeks, monthLabels, maxCount, totalActiveDays };
}
