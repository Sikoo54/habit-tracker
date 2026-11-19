/**
 * Day Detail
 * Assembles everything logged on one calendar day so the activity calendar can
 * answer "what happened that day?": habits, side quests, the reflection, and the
 * wake/bed times saved by the attendance gate.
 */

import { ATTENDANCE_XP, clockLabel } from '../game/attendance';
import { xpForCheckin, xpForReflection, xpForTask } from '../game/xp';
import type { Attendance, Checkin, Habit, Reflection, Task } from '../types';
import { habitsOn } from './checkins';

/** One habit that was due on the day, and whether it was checked. */
export interface DayHabit {
  id: string;
  name: string;
  done: boolean;
}

/** One side quest that belonged to the day. */
export interface DayQuest {
  id: string;
  title: string;
  done: boolean;
}

/** Reflection fields shown in the day detail. */
export interface DayReflection {
  mood: number | null;
  energy: number | null;
  wentWell: string;
}

/** Everything the app knows about one day. */
export interface DaySummary {
  date: string;
  habits: DayHabit[];
  quests: DayQuest[];
  habitsDone: number;
  questsDone: number;
  /** Wake time as HH:MM; empty when that day has no morning stamp. */
  wake: string;
  /** Bed time as HH:MM; empty when that day has no night stamp. */
  bed: string;
  reflection: DayReflection | null;
  /** XP banked on that day, using the same values as the total XP counter. */
  xp: number;
  /** True when the day joined the app's activity history. */
  active: boolean;
}

/**
 * Builds the full picture of a single day. Habits are the ones due that day, so
 * a habit added later never shows up in an earlier day's list.
 */
export function daySummary(
  date: string,
  habits: Habit[],
  checkins: Checkin[],
  tasks: Task[],
  reflections: Reflection[],
  attendance: Attendance[],
): DaySummary {
  const doneIds = new Set(checkins.filter((c) => c.date === date).map((c) => c.habitId));
  const habitRows = habitsOn(habits, date).map((h) => ({
    id: h.id,
    name: h.name,
    done: doneIds.has(h.id),
  }));

  const quests = tasks
    .filter((t) => t.date === date && !t.dropped)
    .map((t) => ({ id: t.id, title: t.title, done: t.done }));

  const record = attendance.find((a) => a.date === date);
  const reflection = reflections.find((r) => r.date === date) ?? null;
  const habitsDone = habitRows.filter((h) => h.done).length;
  const questsDone = quests.filter((q) => q.done).length;

  const xp =
    checkins.filter((c) => c.date === date).length * xpForCheckin() +
    tasks
      .filter((t) => t.date === date && t.done)
      .reduce((sum, t) => sum + xpForTask(t.priority), 0) +
    (reflection ? xpForReflection(reflection) : 0) +
    (record
      ? (record.morning ? ATTENDANCE_XP.morning : 0) + (record.night ? ATTENDANCE_XP.night : 0)
      : 0);

  return {
    date,
    habits: habitRows,
    quests,
    habitsDone,
    questsDone,
    wake: clockLabel(record?.morningAt),
    bed: clockLabel(record?.nightAt),
    reflection: reflection
      ? { mood: reflection.mood, energy: reflection.energy, wentWell: reflection.wentWell }
      : null,
    xp,
    active:
      habitsDone > 0 ||
      questsDone > 0 ||
      reflection !== null ||
      Boolean(record?.morning) ||
      Boolean(record?.night),
  };
}
