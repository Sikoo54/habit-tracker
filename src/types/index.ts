// Core domain types. No `any`, every field explicit.

export type CheckinVariant = 'full' | 'small';

export interface Habit {
  id: string;
  name: string;
  fullVersion: string;
  smallVersion: string;
  trigger: string;
  active: boolean;
  createdAt: string; // ISO timestamp
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  /** true = 3 Prioritas Hari Ini, false = Daftar Lain */
  priority: boolean;
  date: string; // YYYY-MM-DD, the day the task belongs to
  createdAt: string;
}

export interface Checkin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  variant: CheckinVariant;
  createdAt: string;
}

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

export type PageKey = 'today' | 'stats' | 'reflection' | 'focus';

export interface ExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  habits: Habit[];
  tasks: Task[];
  checkins: Checkin[];
  reflections: Reflection[];
}
