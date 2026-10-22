import type { Checkin, Habit } from '../types';
import { addDays, parseDateKey, startOfWeekMonday, weekKeys } from './dates';

export interface DayStat {
  date: string;
  done: number;
  total: number;
  rate: number; // 0..1
}

export interface WeekStat {
  monday: string;
  days: DayStat[];
  totalDone: number;
  totalSlots: number;
  rate: number; // 0..1
}

/** One week of stats (Monday–Sunday) for active habits. */
export function weeklyStats(
  habits: Habit[],
  checkins: Checkin[],
  mondayKey: string,
): WeekStat {
  const active = habits.filter((h) => h.active);
  const days = weekKeys(mondayKey);
  const byDay = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (!byDay.has(c.date)) byDay.set(c.date, new Set());
    byDay.get(c.date)?.add(c.habitId);
  }
  const dayStats: DayStat[] = days.map((date) => {
    const doneSet = byDay.get(date);
    const done = doneSet ? [...doneSet].filter((id) => active.some((h) => h.id === id)).length : 0;
    const total = active.length;
    return { date, done: Math.min(done, total), total, rate: total === 0 ? 0 : Math.min(done, total) / total };
  });
  const totalDone = dayStats.reduce((s, d) => s + d.done, 0);
  const totalSlots = active.length * 7;
  return { monday: mondayKey, days: dayStats, totalDone, totalSlots, rate: totalSlots === 0 ? 0 : totalDone / totalSlots };
}

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

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export interface HeatCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

export interface HeatWeek {
  cells: HeatCell[];
}

export interface AnnualHeatmap {
  weeks: HeatWeek[];
  monthLabels: { index: number; label: string }[];
  maxCount: number;
  totalActiveDays: number;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  const activeIds = new Set(habits.filter((h) => h.active).map((h) => h.id));
  const byDay = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (!activeIds.has(c.habitId)) continue;
    if (!byDay.has(c.date)) byDay.set(c.date, new Set());
    byDay.get(c.date)?.add(c.habitId);
  }

  const endMonday = startOfWeekMonday(referenceKey);
  const startMonday = addDays(endMonday, -7 * weeksBack);

  let maxCount = 0;
  for (const set of byDay.values()) maxCount = Math.max(maxCount, set.size);
  const today = referenceKey;

  const weeks: HeatWeek[] = [];
  const seenMonths = new Set<string>();
  const monthLabels: { index: number; label: string }[] = [];

  for (let w = 0; w <= weeksBack; w += 1) {
    const monday = addDays(startMonday, w * 7);
      
    const cells: HeatCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(monday, d);
      const count = byDay.get(date)?.size ?? 0;
      cells.push({ date, count, level: heatLevel(count, maxCount), future: date > today });
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

  return { weeks, monthLabels, maxCount, totalActiveDays: byDay.size };
}
