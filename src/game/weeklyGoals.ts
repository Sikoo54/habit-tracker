/**
 * Weekly Habit Goals Engine
 * Evaluates progress against user-configured weekly target check-in counts
 * (e.g. 4 times per week) across Monday-to-Sunday calendar weeks.
 */

import type { Checkin, Habit } from '../types';
import { startOfWeekMonday, weekKeys } from '../utils/dates';

/** Checkins for one habit within a Monday–Sunday week. */
export function weeklyCheckinCount(checkins: Checkin[], habitId: string, mondayKey: string): number {
  const days = new Set(weekKeys(mondayKey));
  const dates = new Set(
    checkins.filter((c) => c.habitId === habitId && days.has(c.date)).map((c) => c.date),
  );
  return dates.size;
}

/** Weekly goal completion stats for an individual habit */
export interface GoalProgress {
  habitId: string;
  name: string;
  goal: number;
  done: number;
  /** 0..1, capped at 1. */
  rate: number;
  met: boolean;
}

/** Progress toward one habit's weekly goal, for the week starting `mondayKey`. */
export function goalProgress(habit: Habit, checkins: Checkin[], mondayKey: string): GoalProgress {
  const done = weeklyCheckinCount(checkins, habit.id, mondayKey);
  const goal = habit.weeklyGoal;
  return {
    habitId: habit.id,
    name: habit.name,
    goal,
    done,
    rate: goal <= 0 ? 0 : Math.min(done / goal, 1),
    met: goal > 0 && done >= goal,
  };
}

/** Weekly-goal progress for every active habit that has a goal set. */
export function weeklyGoals(
  habits: Habit[],
  checkins: Checkin[],
  referenceKey: string,
): GoalProgress[] {
  const monday = startOfWeekMonday(referenceKey);
  return habits
    .filter((h) => h.active && h.weeklyGoal > 0)
    .map((h) => goalProgress(h, checkins, monday));
}

/** How many goals were met vs total, for the week containing `referenceKey`. */
export function weeklyGoalSummary(
  habits: Habit[],
  checkins: Checkin[],
  referenceKey: string,
): { met: number; total: number } {
  const goals = weeklyGoals(habits, checkins, referenceKey);
  return { met: goals.filter((g) => g.met).length, total: goals.length };
}

/** Days left in the current week (Mon..Sun), inclusive of today. */
export function daysLeftInWeek(referenceKey: string): number {
  const monday = startOfWeekMonday(referenceKey);
  const idx = weekKeys(monday).indexOf(referenceKey);
  return idx < 0 ? 0 : 7 - idx;
}
