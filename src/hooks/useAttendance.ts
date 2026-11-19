/**
 * Attendance State Hook
 * Manages morning/night attendance state with asynchronous storage syncing
 * and toggling actions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { attendanceFor, stampAttendance, type AttendanceSlot } from '../game/attendance';
import { useStorage } from '../storage/StorageContext';
import type { Attendance } from '../types';

/** Custom hook providing attendance records and toggle actions */
export function useAttendance() {
  const storage = useStorage();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getAttendance()
      .then((a) => {
        if (!alive) return;
        setAttendance(a);
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
    void storage.saveAttendance(attendance).catch(() => undefined);
  }, [attendance, storage]);

  /** Marks a slot for that day and stores the exact tap time. */
  const mark = useCallback((date: string, slot: AttendanceSlot) => {
    setAttendance((prev) => stampAttendance(prev, date, slot, new Date().toISOString()));
  }, []);

  const attendanceOn = useCallback(
    (date: string): Attendance | null => attendanceFor(attendance, date),
    [attendance],
  );

  return { attendance, loading, mark, attendanceOn };
}
