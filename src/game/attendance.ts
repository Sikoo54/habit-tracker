/**
 * Attendance & Check-in Gate System
 * Handles morning and night app attendance tracking, XP awards for daily check-in,
 * and time-based gate windows that prompt the user upon waking and before sleep.
 */

import type { Attendance } from '../types';

// Morning/night absen: the point is opening the app at wake and before bed.
// XP is derived from the flags — no separate score to drift out of sync.

/** XP rewards for morning and night check-ins */
export const ATTENDANCE_XP = {
  morning: 5,
  night: 5,
} as const;

/** Check-in slot identifier */
export type AttendanceSlot = 'morning' | 'night';

/** Calculates cumulative XP earned from attendance check-ins */
export function attendanceXp(attendance: Attendance[]): number {
  let xp = 0;
  for (const a of attendance) {
    if (a.morning) xp += ATTENDANCE_XP.morning;
    if (a.night) xp += ATTENDANCE_XP.night;
  }
  return xp;
}

/** Finds attendance record for a specific date */
export function attendanceFor(attendance: Attendance[], date: string): Attendance | null {
  return attendance.find((a) => a.date === date) ?? null;
}

/** Toggle one slot for a day. Row disappears when both slots end up off. */
export function toggleAttendance(
  attendance: Attendance[],
  date: string,
  slot: AttendanceSlot,
): Attendance[] {
  const cur = attendanceFor(attendance, date);
  const next: Attendance = {
    date,
    morning: slot === 'morning' ? !(cur?.morning ?? false) : (cur?.morning ?? false),
    night: slot === 'night' ? !(cur?.night ?? false) : (cur?.night ?? false),
  };
  const others = attendance.filter((a) => a.date !== date);
  if (!next.morning && !next.night) return others;
  return [...others, next];
}

/** Days with any absen — counts as activity for the global daily streak. */
export function attendedDates(attendance: Attendance[]): Set<string> {
  const s = new Set<string>();
  for (const a of attendance) {
    if (a.morning || a.night) s.add(a.date);
  }
  return s;
}

// Full-screen absen window. Morning gate becomes available at 04:00 and
// stays pending all day; night takes over at 20:00. Once a slot is marked,
// that gate is done for the day.
export const MORNING_START_HOUR = 4;
export const NIGHT_START_HOUR = 20;

/**
 * Which absen screen should block the app right now, if any.
 * Night (20:00+) wins; otherwise morning from 04:00. Night means the
 * morning slot was missed, so it is not retroactively gated.
 */
export function gateFor(attendance: Attendance[], date: string, hour: number): AttendanceSlot | null {
  const a = attendanceFor(attendance, date);
  if (hour >= NIGHT_START_HOUR) return a?.night === true ? null : 'night';
  if (hour >= MORNING_START_HOUR) return a?.morning === true ? null : 'morning';
  return null;
}
