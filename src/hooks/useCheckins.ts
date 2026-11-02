/**
 * Habit Check-ins Hook
 * Manages daily habit check-in logs and persistent storage synchronization.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { Checkin } from '../types';
import { createId } from '../utils/dates';

/** Custom hook providing checkin status and toggle capabilities */
export function useCheckins() {
  const storage = useStorage();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getCheckins()
      .then((c) => {
        if (!alive) return;
        setCheckins(c);
        setLoading(false);
        loaded.current = true;
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [storage]);

  useEffect(() => {
    if (!loaded.current) return;
    void storage.saveCheckins(checkins).catch(() => undefined);
  }, [checkins, storage]);

  /** Toggle: jika sudah ada checkin habit+date -> hapus; jika tidak -> buat. */
  const toggleCheckin = useCallback((habitId: string, date: string) => {
    setCheckins((prev) => {
      const existing = prev.find((c) => c.habitId === habitId && c.date === date);
      if (existing) return prev.filter((c) => c.id !== existing.id);
      const c: Checkin = { id: createId('checkin'), habitId, date, createdAt: new Date().toISOString() };
      return [...prev, c];
    });
  }, []);

  const checkinFor = useCallback(
    (habitId: string, date: string): Checkin | undefined =>
      checkins.find((c) => c.habitId === habitId && c.date === date),
    [checkins],
  );

  /**
   * Explicit set used by backfill: false clears, true adds.
   * `createdAt` stays from the original write so the late marker survives.
   */
  const setCheckin = useCallback((habitId: string, date: string, done: boolean) => {
    setCheckins((prev) => {
      const existing = prev.find((c) => c.habitId === habitId && c.date === date);
      if (!done) return existing ? prev.filter((c) => c.id !== existing.id) : prev;
      if (existing) return prev;
      const c: Checkin = { id: createId('checkin'), habitId, date, createdAt: new Date().toISOString() };
      return [...prev, c];
    });
  }, []);

  return { checkins, loading, toggleCheckin, setCheckin, checkinFor, setCheckins };
}
