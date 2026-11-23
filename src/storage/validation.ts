/**
 * Storage Validation Guards
 * Runtime type guards shared by the storage adapter and import preview, so
 * saved data and uploaded backups are checked against the same schema.
 */

import type { DecayLedger } from '../game/decay';
import type {
  Attendance,
  Checkin,
  Goal,
  Habit,
  HabitArchivePeriod,
  Quote,
  Reflection,
  Task,
} from '../types';

/** True when the value is a non-null object record. */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** True when the value is a string. */
export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/** True when the value is a boolean. */
export function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

/** True when the value is one archive period on a habit. */
export function validArchivePeriod(v: unknown): v is HabitArchivePeriod {
  return isRecord(v) && isString(v.from) && (v.to === undefined || isString(v.to));
}

/** True when the value has every required habit field. */
export function validHabit(v: unknown): v is Habit {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.name) &&
    isString(v.fullVersion) &&
    isString(v.trigger) &&
    isBoolean(v.active) &&
    (v.weeklyGoal === undefined || typeof v.weeklyGoal === 'number') &&
    (v.archivedAt === undefined || isString(v.archivedAt)) &&
    (v.archives === undefined ||
      (Array.isArray(v.archives) && v.archives.every(validArchivePeriod))) &&
    isString(v.createdAt)
  );
}

/** True when the value has every required task field. */
export function validTask(v: unknown): v is Task {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.title) &&
    isBoolean(v.done) &&
    isBoolean(v.priority) &&
    isString(v.date) &&
    isString(v.createdAt)
  );
}

/** True when the value has every required check-in field. */
export function validCheckin(v: unknown): v is Checkin {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.habitId) &&
    isString(v.date) &&
    isString(v.createdAt)
  );
}

/** True when the value has every required reflection field. */
export function validReflection(v: unknown): v is Reflection {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.date) &&
    isString(v.wentWell) &&
    isString(v.toImprove) &&
    (typeof v.mood === 'number' || v.mood === null) &&
    (typeof v.energy === 'number' || v.energy === null) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

/** True when the value has every required attendance field; tap times are optional. */
export function validAttendance(v: unknown): v is Attendance {
  return (
    isRecord(v) &&
    isString(v.date) &&
    isBoolean(v.morning) &&
    isBoolean(v.night) &&
    (v.morningAt === undefined || isString(v.morningAt)) &&
    (v.nightAt === undefined || isString(v.nightAt))
  );
}

/** True when the value has a usable goal shape (target date is optional). */
export function validGoal(v: unknown): v is Goal {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.title) &&
    isString(v.why) &&
    (v.targetDate === undefined || isString(v.targetDate)) &&
    (v.starred === undefined || typeof v.starred === 'boolean') &&
    isString(v.createdAt)
  );
}

/** True when the value has a usable quote shape (author may be null). */
export function validQuote(v: unknown): v is Quote {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.text) &&
    (v.author === null || isString(v.author)) &&
    isString(v.createdAt)
  );
}

/** True when the value is a usable frost ledger. */
export function validDecay(v: unknown): v is DecayLedger {
  return (
    isRecord(v) &&
    typeof v.total === 'number' &&
    Number.isFinite(v.total) &&
    v.total >= 0 &&
    (typeof v.appliedThrough === 'string' || v.appliedThrough === null)
  );
}
