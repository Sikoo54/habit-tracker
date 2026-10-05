import type { Checkin, ExportPayload, Habit, Reflection, Task } from '../types';
import type { StorageAdapter } from './types';

const SCHEMA_VERSION = 1;
const PREFIX = 'habittracker.v2.';

const KEYS = {
  habits: `${PREFIX}habits`,
  tasks: `${PREFIX}tasks`,
  checkins: `${PREFIX}checkins`,
  reflections: `${PREFIX}reflections`,
  seeded: `${PREFIX}seeded`,
} as const;

// --- Runtime validation on read (localStorage data can be corrupt / old version) ---

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function validHabit(v: unknown): v is Habit {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.name) &&
    isString(v.fullVersion) &&
    isString(v.smallVersion) &&
    isString(v.trigger) &&
    isBoolean(v.active) &&
    isString(v.createdAt)
  );
}

function validTask(v: unknown): v is Task {
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

function validCheckin(v: unknown): v is Checkin {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.habitId) &&
    isString(v.date) &&
    (v.variant === 'full' || v.variant === 'small') &&
    isString(v.createdAt)
  );
}

function validReflection(v: unknown): v is Reflection {
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

function writeArray(key: string, value: unknown[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota full / private mode: ignore silently, UI keeps running in-memory.
  }
}

/** Default implementation: localStorage. Always safe (try/catch + validation). */
export class LocalStorageAdapter implements StorageAdapter {
  readonly schemaVersion = SCHEMA_VERSION;

  async getHabits(): Promise<Habit[]> {
    return readArray(KEYS.habits, validHabit);
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

  async exportAll(): Promise<ExportPayload> {
    const [habits, tasks, checkins, reflections] = await Promise.all([
      this.getHabits(),
      this.getTasks(),
      this.getCheckins(),
      this.getReflections(),
    ]);
    return { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), habits, tasks, checkins, reflections };
  }

  async importAll(payload: ExportPayload): Promise<void> {
    if (!isRecord(payload) || payload.schemaVersion !== SCHEMA_VERSION) {
      throw new Error('Unrecognized import format (schemaVersion mismatch).');
    }
    const p = payload as unknown as Record<string, unknown>;
    if (!Array.isArray(p.habits) || !Array.isArray(p.tasks) || !Array.isArray(p.checkins) || !Array.isArray(p.reflections)) {
      throw new Error('Import file is corrupt: main fields missing.');
    }
    const habits = (p.habits as unknown[]).filter(validHabit);
    const tasks = (p.tasks as unknown[]).filter(validTask);
    const checkins = (p.checkins as unknown[]).filter(validCheckin);
    const reflections = (p.reflections as unknown[]).filter(validReflection);
    await Promise.all([
      this.saveHabits(habits),
      this.saveTasks(tasks),
      this.saveCheckins(checkins),
      this.saveReflections(reflections),
    ]);
  }

  async clearAll(): Promise<void> {
    try {
      window.localStorage.removeItem(KEYS.habits);
      window.localStorage.removeItem(KEYS.tasks);
      window.localStorage.removeItem(KEYS.checkins);
      window.localStorage.removeItem(KEYS.reflections);
      window.localStorage.removeItem(KEYS.seeded);
    } catch {
      // abaikan
    }
  }

  isSeeded(): boolean {
    try {
      return window.localStorage.getItem(KEYS.seeded) === '1';
    } catch {
      return false;
    }
  }

  markSeeded(): void {
    try {
      window.localStorage.setItem(KEYS.seeded, '1');
    } catch {
      // abaikan
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
