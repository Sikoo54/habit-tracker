/**
 * Core Domain Types
 * Defines data models for habits, tasks, checkins, reflections, attendance,
 * navigation pages, and backup export/import payloads.
 */

// Core domain types. No `any`, every field explicit.

/** Type of checkin: full target vs small minimum version */
export type CheckinVariant = 'full' | 'small';

/** Habit entity representation */
export interface Habit {
  id: string;
  name: string;
  fullVersion: string;
  smallVersion: string;
  trigger: string;
  active: boolean;
  /** Target check-ins per week. 0 = no weekly goal. */
  weeklyGoal: number;
  createdAt: string; // ISO timestamp
}

/** Input payload for creating or updating a habit */
export interface HabitInput {
  name: string;
  fullVersion: string;
  smallVersion: string;
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
}

/** Record of a habit completion on a specific day */
export interface Checkin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  variant: CheckinVariant;
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
}
