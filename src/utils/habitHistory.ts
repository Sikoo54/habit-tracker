/**
 * Habit History Helpers
 * Builds a per-day 30-day timeline for one habit, including due/archive gaps,
 * late check-ins, missed days, and completion totals for the detail overlay.
 */

import type { Checkin, Habit } from '../types';
import { isLateCheckin, habitsOn } from './checkins';
import { addDays, toDateKey } from './dates';

/** One day in a single habit's recent history. */
export interface HabitHistoryDay {
  date: string;
  /** The habit was on the board that day (created and not archived). */
  due: boolean;
  done: boolean;
  /** Checked later than the day it covers. */
  late: boolean;
  /** Due, past, and still unchecked. Today never counts as missed. */
  missed: boolean;
  isToday: boolean;
  /** Local day the late check-in was actually written. */
  loggedDate?: string;
}

/** Totals for the visible habit-history window. */
export interface HabitHistorySummary {
  due: number;
  done: number;
  missed: number;
  late: number;
  /** Done ÷ due, rounded to a whole percent. */
  rate: number;
}

/** A habit's recent days plus the totals shown above its calendar. */
export interface HabitHistory {
  days: HabitHistoryDay[];
  summary: HabitHistorySummary;
}

/**
 * Builds the last `length` days for one habit, oldest first, so the calendar
 * reads left to right and today sits at the end.
 */
export function habitHistory(
  habit: Habit,
  checkins: Checkin[],
  today: string,
  length = 30,
): HabitHistory {
  const byDate = new Map<string, Checkin>();
  for (const checkin of checkins) {
    if (checkin.habitId === habit.id) byDate.set(checkin.date, checkin);
  }

  const days: HabitHistoryDay[] = [];
  for (let offset = length - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const due = habitsOn([habit], date).length > 0;
    const checkin = byDate.get(date);
    const late = Boolean(checkin && isLateCheckin(checkin));
    const loggedDate =
      late && checkin
        ? Number.isNaN(new Date(checkin.createdAt).getTime())
          ? undefined
          : toDateKey(new Date(checkin.createdAt))
        : undefined;

    days.push({
      date,
      due,
      done: Boolean(checkin),
      late,
      missed: due && !checkin && date < today,
      isToday: date === today,
      ...(loggedDate ? { loggedDate } : {}),
    });
  }

  const summary = days.reduce<HabitHistorySummary>(
    (acc, day) => {
      if (day.due) acc.due += 1;
      if (day.due && day.done) acc.done += 1;
      if (day.missed) acc.missed += 1;
      if (day.due && day.late) acc.late += 1;
      return acc;
    },
    { due: 0, done: 0, missed: 0, late: 0, rate: 0 },
  );
  summary.rate = summary.due > 0 ? Math.round((summary.done / summary.due) * 100) : 0;

  return { days, summary };
}
