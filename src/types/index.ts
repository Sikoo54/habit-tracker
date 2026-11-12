/**
 * Core Domain Types
 * Defines data models for habits, tasks, checkins, reflections, attendance,
 * navigation pages, and backup export/import payloads.
 */

import type { DecayLedger } from '../game/decay';

// Core domain types. No `any`, every field explicit.

/** One stretch when a habit was off the daily board. */
export interface HabitArchivePeriod {
  from: string; // ISO timestamp, archive start
  /** ISO timestamp, restore time. Missing while the habit is still archived. */
  to?: string;
}

/** Habit entity representation */
export interface Habit {
  id: string;
  name: string;
  /** What finishing the habit looks like — the single target. */
  fullVersion: string;
  trigger: string;
  active: boolean;
  /** Target check-ins per week. 0 = no weekly goal. */
  weeklyGoal: number;
  createdAt: string; // ISO timestamp
  /**
   * Start of the current archive, or absent while active. Archived habits leave
   * the daily board but still count for every date before this timestamp.
   */
  archivedAt?: string;
  /**
   * Every archive period, oldest first. A closed period is a gap when the habit
   * was not due; keeping it means restore never rewrites past stats.
   */
  archives?: HabitArchivePeriod[];
}

/** Input payload for creating or updating a habit */
export interface HabitInput {
  name: string;
  fullVersion: string;
  trigger: string;
  weeklyGoal: number;
}

/** Daily task entity */
export interface Task {
  id: string;
  title: string;
  done: boolean;
  /** true = 3 Prioritas Hari Ini, false = Daftar Lain */
  priority: boolean;
  date: string; // YYYY-MM-DD, the day the task belongs to
  createdAt: string;
  /** Leftover task the user chose to let go. Kept as history, never shown again. */
  dropped?: boolean;
}

/** Record of a habit completion on a specific day */
export interface Checkin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

/** Daily reflection entry capturing wins, improvements, and wellness */
export interface Reflection {
  id: string;
  date: string; // YYYY-MM-DD, unique per day
  wentWell: string;
  toImprove: string;
  mood: number | null; // 1-5
  energy: number | null; // 1-5
  createdAt: string;
  updatedAt: string;
}

/** One row per day: morning/night absen (open app at wake & before bed). */
export interface Attendance {
  date: string; // YYYY-MM-DD, unique per day
  morning: boolean;
  night: boolean;
}

/** Available navigation pages */
export type PageKey = 'today' | 'stats' | 'reflection' | 'focus';

/** Complete backup schema for export/import */
export interface ExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  habits: Habit[];
  tasks: Task[];
  checkins: Checkin[];
  reflections: Reflection[];
  attendance: Attendance[];
  /** Frost ledger; absent in backups made before it was included. */
  decay?: DecayLedger;
}
