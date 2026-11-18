/**
 * LocalStorage Storage Adapter
 * Implements the StorageAdapter interface using the browser's localStorage API,
 * complete with runtime schema validation, normalization, import/export, and clear capabilities.
 */

import { DECAY_KEY, type DecayLedger } from '../game/decay';
import type { Attendance, Checkin, ExportPayload, Goal, Habit, Reflection, Task } from '../types';
import { previewImport } from './importPreview';
import type { StorageAdapter } from './types';
import {
  validAttendance,
  validCheckin,
  validDecay,
  validGoal,
  validHabit,
  validReflection,
  validTask,
} from './validation';

const SCHEMA_VERSION = 1;
const PREFIX = 'habittracker.v2.';

const KEYS = {
  habits: `${PREFIX}habits`,
  tasks: `${PREFIX}tasks`,
  checkins: `${PREFIX}checkins`,
  reflections: `${PREFIX}reflections`,
  attendance: `${PREFIX}attendance`,
  goals: `${PREFIX}goals`,
  seeded: `${PREFIX}seeded`,
  tasksSeeded: `${PREFIX}tasksSeeded`,
} as const;

// --- Runtime validation on read (localStorage data can be corrupt / old version) ---

/**
 * Fill fields added after v1 and drop retired ones (the old small version), so
 * saved habits stay lean and keep working.
 */
function normalizeHabit(h: Habit): Habit {
  // Older saves only know `archivedAt`; promote it to a single archive period
  // so restore can close the gap without rewriting history.
  const archives =
    h.archives && h.archives.length > 0
      ? h.archives
      : h.archivedAt
        ? [{ from: h.archivedAt }]
        : undefined;
  return {
    id: h.id,
    name: h.name,
    fullVersion: h.fullVersion,
    trigger: h.trigger,
    active: h.active,
    weeklyGoal: typeof h.weeklyGoal === 'number' ? h.weeklyGoal : 0,
    createdAt: h.createdAt,
    ...(h.archivedAt ? { archivedAt: h.archivedAt } : {}),
    ...(archives ? { archives } : {}),
  };
}

/** Safely reads and validates an array from localStorage */
function readArray<T>(key: string, guard: (v: unknown) => v is T): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(guard);
  } catch {
    // Corrupt data -> treat as empty, never crash the app.
    return [];
  }
}

/** Safely serializes and writes an array to localStorage */
function writeArray(key: string, value: unknown[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota full / private mode: ignore silently, UI keeps running in-memory.
  }
}

/** True when a parsed value is a usable frost ledger. */
function readDecay(): DecayLedger | undefined {
  try {
    const raw = window.localStorage.getItem(DECAY_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return validDecay(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** Writes (or clears) the frost ledger. Failures are non-fatal. */
function writeDecay(ledger: DecayLedger | undefined): void {
  try {
    if (ledger === undefined) window.localStorage.removeItem(DECAY_KEY);
    else window.localStorage.setItem(DECAY_KEY, JSON.stringify(ledger));
  } catch {
    // Quota full / private mode: keep the in-memory session running.
  }
}

/** Default implementation: localStorage. Always safe (try/catch + validation). */
export class LocalStorageAdapter implements StorageAdapter {
  readonly schemaVersion = SCHEMA_VERSION;

  async getHabits(): Promise<Habit[]> {
    return readArray(KEYS.habits, validHabit).map(normalizeHabit);
  }
  async saveHabits(habits: Habit[]): Promise<void> {
    writeArray(KEYS.habits, habits);
  }
  async getTasks(): Promise<Task[]> {
    return readArray(KEYS.tasks, validTask);
  }
  async saveTasks(tasks: Task[]): Promise<void> {
    writeArray(KEYS.tasks, tasks);
  }
  async getCheckins(): Promise<Checkin[]> {
    return readArray(KEYS.checkins, validCheckin);
  }
  async saveCheckins(checkins: Checkin[]): Promise<void> {
    writeArray(KEYS.checkins, checkins);
  }
  async getReflections(): Promise<Reflection[]> {
    return readArray(KEYS.reflections, validReflection);
  }
  async saveReflections(reflections: Reflection[]): Promise<void> {
    writeArray(KEYS.reflections, reflections);
  }
  async getAttendance(): Promise<Attendance[]> {
    return readArray(KEYS.attendance, validAttendance);
  }
  async saveAttendance(attendance: Attendance[]): Promise<void> {
    writeArray(KEYS.attendance, attendance);
  }
  async getGoals(): Promise<Goal[]> {
    return readArray(KEYS.goals, validGoal);
  }
  async saveGoals(goals: Goal[]): Promise<void> {
    writeArray(KEYS.goals, goals);
  }

  async exportAll(): Promise<ExportPayload> {
    const [habits, tasks, checkins, reflections, attendance, goals] = await Promise.all([
      this.getHabits(),
      this.getTasks(),
      this.getCheckins(),
      this.getReflections(),
      this.getAttendance(),
      this.getGoals(),
    ]);
    const decay = readDecay();
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      habits,
      tasks,
      checkins,
      reflections,
      attendance,
      goals,
      ...(decay ? { decay } : {}),
    };
  }

  async importAll(payload: ExportPayload): Promise<void> {
    const preview = previewImport(payload);
    if (!preview.ok) throw new Error(preview.reason);
    const p = preview.payload;
    await Promise.all([
      this.saveHabits(p.habits),
      this.saveTasks(p.tasks),
      this.saveCheckins(p.checkins),
      this.saveReflections(p.reflections),
      this.saveAttendance(p.attendance),
      this.saveGoals(p.goals ?? []),
    ]);
    // Older backups carry no ledger: clearing it prevents stale frost from
    // eating the freshly imported XP.
    writeDecay(p.decay);
    // An intentional empty list must stay empty after the reload.
    this.markSeeded();
    this.markTasksSeeded();
  }

  async clearAll(): Promise<void> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key?.startsWith(PREFIX)) keys.push(key);
      }
      for (const key of keys) window.localStorage.removeItem(key);
    } catch {
      // abaikan
    }
  }

  /** Checks if seed data has already been populated */
  isSeeded(): boolean {
    try {
      return window.localStorage.getItem(KEYS.seeded) === '1';
    } catch {
      return false;
    }
  }

  /** Marks initial seeding as completed */
  markSeeded(): void {
    try {
      window.localStorage.setItem(KEYS.seeded, '1');
    } catch {
      // abaikan
    }
  }

  /** True once the starter side quests have been offered (or deliberately skipped). */
  isTasksSeeded(): boolean {
    try {
      return window.localStorage.getItem(KEYS.tasksSeeded) === '1';
    } catch {
      return false;
    }
  }

  /** Remembers that starter side quests must not come back after deletion. */
  markTasksSeeded(): void {
    try {
      window.localStorage.setItem(KEYS.tasksSeeded, '1');
    } catch {
      // abaikan
    }
  }
}

/** Singleton instance of LocalStorageAdapter */
export const localStorageAdapter = new LocalStorageAdapter();
