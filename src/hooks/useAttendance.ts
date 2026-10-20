import { useCallback, useEffect, useRef, useState } from 'react';
import { attendanceFor, toggleAttendance, type AttendanceSlot } from '../game/attendance';
import { useStorage } from '../storage/StorageContext';
import type { Attendance } from '../types';

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

  /** Toggle absen: pagi (morning) atau malam (night) untuk tanggal itu. */
  const mark = useCallback((date: string, slot: AttendanceSlot) => {
    setAttendance((prev) => toggleAttendance(prev, date, slot));
  }, []);

  const attendanceOn = useCallback(
    (date: string): Attendance | null => attendanceFor(attendance, date),
    [attendance],
  );

  return { attendance, loading, mark, attendanceOn };
}
