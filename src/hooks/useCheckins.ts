import { useCallback, useEffect, useRef, useState } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { Checkin, CheckinVariant } from '../types';
import { createId } from '../utils/dates';

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
  const toggleCheckin = useCallback((habitId: string, date: string, variant: CheckinVariant) => {
    setCheckins((prev) => {
      const existing = prev.find((c) => c.habitId === habitId && c.date === date);
      if (existing) return prev.filter((c) => c.id !== existing.id);
      const c: Checkin = { id: createId('checkin'), habitId, date, variant, createdAt: new Date().toISOString() };
      return [...prev, c];
    });
  }, []);

  const checkinFor = useCallback(
    (habitId: string, date: string): Checkin | undefined =>
      checkins.find((c) => c.habitId === habitId && c.date === date),
    [checkins],
  );

  return { checkins, loading, toggleCheckin, checkinFor, setCheckins };
}
