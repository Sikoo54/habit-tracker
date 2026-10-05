import type { Checkin, ExportPayload, Habit, Reflection, Task } from '../types';

// Storage abstraction. Components/hooks only talk to this interface,
// never localStorage / Supabase directly.
// All methods async so it can be swapped for a remote backend later.

export interface StorageAdapter {
  getHabits(): Promise<Habit[]>;
  saveHabits(habits: Habit[]): Promise<void>;
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getCheckins(): Promise<Checkin[]>;
  saveCheckins(checkins: Checkin[]): Promise<void>;
  getReflections(): Promise<Reflection[]>;
  saveReflections(reflections: Reflection[]): Promise<void>;
  exportAll(): Promise<ExportPayload>;
  importAll(payload: ExportPayload): Promise<void>;
  clearAll(): Promise<void>;
}
