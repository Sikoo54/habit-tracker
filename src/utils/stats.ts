import type { Checkin, Habit } from '../types';
import { addDays, startOfWeekMonday, weekKeys } from './dates';

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
