/**
 * Import Preview
 * Validates an uploaded backup and summarizes its contents before the storage
 * adapter replaces any local data. Invalid records are counted, never hidden.
 */

import type { Attendance, Checkin, ExportPayload, Habit, Reflection, Task } from '../types';
import {
  isRecord,
  isString,
  validAttendance,
  validCheckin,
  validDecay,
  validHabit,
  validReflection,
  validTask,
} from './validation';

/** Counts shown in the import confirmation dialog. */
export interface ImportSummary {
  /** ISO timestamp from the file, or null when missing/corrupt. */
  exportedAt: string | null;
  habits: number;
  activeHabits: number;
  archivedHabits: number;
  tasks: number;
  checkins: number;
  reflections: number;
  attendance: number;
  /** Records dropped because they failed validation. */
  skipped: number;
}

/** Result of inspecting a file before import. */
export type ImportPreview =
  { ok: true; payload: ExportPayload; summary: ImportSummary } | { ok: false; reason: string };

/** Validates a parsed backup and returns the cleaned payload plus its summary. */
export function previewImport(raw: unknown): ImportPreview {
  if (!isRecord(raw)) {
    return { ok: false, reason: 'This file is not an AscendHabit backup.' };
  }
  if (raw.schemaVersion !== 1) {
    return { ok: false, reason: 'Unsupported backup version. This build reads version 1.' };
  }
  if (
    !Array.isArray(raw.habits) ||
    !Array.isArray(raw.tasks) ||
    !Array.isArray(raw.checkins) ||
    !Array.isArray(raw.reflections)
  ) {
    return { ok: false, reason: 'Import file is corrupt: main fields are missing.' };
  }
  if (raw.attendance !== undefined && !Array.isArray(raw.attendance)) {
    return { ok: false, reason: 'Import file is corrupt: attendance is invalid.' };
  }
  if (raw.decay !== undefined && !validDecay(raw.decay)) {
    return { ok: false, reason: 'Import file is corrupt: the frost ledger is invalid.' };
  }

  const rawHabits = raw.habits;
  const rawTasks = raw.tasks;
  const rawCheckins = raw.checkins;
  const rawReflections = raw.reflections;
  const rawAttendance: unknown[] = Array.isArray(raw.attendance) ? raw.attendance : [];

  const habits = rawHabits.filter(validHabit) as Habit[];
  const tasks = rawTasks.filter(validTask) as Task[];
  const checkins = rawCheckins.filter(validCheckin) as Checkin[];
  const reflections = rawReflections.filter(validReflection) as Reflection[];
  const attendance = rawAttendance.filter(validAttendance) as Attendance[];
  const archivedHabits = habits.filter((h) => h.archivedAt).length;

  const skipped =
    rawHabits.length -
    habits.length +
    (rawTasks.length - tasks.length) +
    (rawCheckins.length - checkins.length) +
    (rawReflections.length - reflections.length) +
    (rawAttendance.length - attendance.length);

  const exportedAt = isString(raw.exportedAt) ? raw.exportedAt : null;
  const payload: ExportPayload = {
    schemaVersion: 1,
    exportedAt: exportedAt ?? '',
    habits,
    tasks,
    checkins,
    reflections,
    attendance,
    ...(raw.decay ? { decay: raw.decay } : {}),
  };

  return {
    ok: true,
    payload,
    summary: {
      exportedAt,
      habits: habits.length,
      activeHabits: habits.length - archivedHabits,
      archivedHabits,
      tasks: tasks.length,
      checkins: checkins.length,
      reflections: reflections.length,
      attendance: attendance.length,
      skipped,
    },
  };
}
