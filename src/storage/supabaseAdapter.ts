import type { Checkin, ExportPayload, Habit, Reflection, Task } from '../types';
import type { StorageAdapter } from './types';

// ============================================================================
// Supabase PLACEHOLDER — not active yet. How to enable:
//   1. `npm i @supabase/supabase-js`
//   2. Create tables: habits, tasks, checkins, reflections (columns = types in src/types)
//      + a `user_id` column for per-user RLS.
//   3. Fill in the methods below with Supabase queries, then swap the adapter
//      in <StorageProvider adapter={new SupabaseAdapter(...)} />.
//   4. Add login (Supabase Auth) before reading data.
// ============================================================================
//
// TODO: implement each method with supabase.from('habits').select() etc.
// TODO: map snake_case DB rows <-> camelCase app types in one function.
// TODO: handle offline: fall back to LocalStorageAdapter as cache.

export class SupabaseAdapter implements StorageAdapter {
  // constructor(
  //   private supabaseUrl: string,
  //   private supabaseAnonKey: string,
  //   private userId: string,
  // ) {}

  private notReady(): Error {
    return new Error('SupabaseAdapter belum dikonfigurasi. Lihat TODO di supabaseAdapter.ts.');
  }

  async getHabits(): Promise<Habit[]> {
    throw this.notReady();
  }
  async saveHabits(): Promise<void> {
    throw this.notReady();
  }
  async getTasks(): Promise<Task[]> {
    throw this.notReady();
  }
  async saveTasks(): Promise<void> {
    throw this.notReady();
  }
  async getCheckins(): Promise<Checkin[]> {
    throw this.notReady();
  }
  async saveCheckins(): Promise<void> {
    throw this.notReady();
  }
  async getReflections(): Promise<Reflection[]> {
    throw this.notReady();
  }
  async saveReflections(): Promise<void> {
    throw this.notReady();
  }
  async exportAll(): Promise<ExportPayload> {
    throw this.notReady();
  }
  async importAll(): Promise<void> {
    throw this.notReady();
  }
  async clearAll(): Promise<void> {
    throw this.notReady();
  }
}

export const _TODO_ACTIVATE_SUPABASE = false;
void _TODO_ACTIVATE_SUPABASE;
