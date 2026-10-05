import { useCallback, useEffect, useRef, useState } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { Reflection } from '../types';
import { createId } from '../utils/dates';

export function useReflections() {
  const storage = useStorage();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getReflections()
      .then((r) => {
        if (!alive) return;
        setReflections(r);
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
    void storage.saveReflections(reflections).catch(() => undefined);
  }, [reflections, storage]);

  const saveReflection = useCallback(
    (date: string, wentWell: string, toImprove: string, mood: number | null, energy: number | null) => {
      setReflections((prev) => {
        const existing = prev.find((r) => r.date === date);
        const now = new Date().toISOString();
        if (existing) {
          return prev.map((r) =>
            r.date === date ? { ...r, wentWell, toImprove, mood, energy, updatedAt: now } : r,
          );
        }
        const r: Reflection = {
          id: createId('refl'),
          date,
          wentWell,
          toImprove,
          mood,
          energy,
          createdAt: now,
          updatedAt: now,
        };
        return [...prev, r];
      });
    },
    [],
  );

  const getByDate = useCallback(
    (date: string): Reflection | undefined => reflections.find((r) => r.date === date),
    [reflections],
  );

  return { reflections, loading, saveReflection, getByDate, setReflections };
}
