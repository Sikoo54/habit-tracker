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
  const morning = slot === 'morning' ? !(cur?.morning ?? false) : (cur?.morning ?? false);
  const night = slot === 'night' ? !(cur?.night ?? false) : (cur?.night ?? false);
  const next: Attendance = { date, morning, night };
  // A stamp belongs to its slot: turning the slot off drops the old time.
  if (morning && cur?.morningAt) next.morningAt = cur.morningAt;
  if (night && cur?.nightAt) next.nightAt = cur.nightAt;
  const others = attendance.filter((a) => a.date !== date);
  if (!next.morning && !next.night) return others;
  return [...others, next];
}

/**
 * Marks one slot done and stores the moment it was tapped. Used by the daily
 * gate so the wake-up time is the real clock time, not a guess. Re-tapping a
 * slot keeps the first stamp.
 */
export function stampAttendance(
  attendance: Attendance[],
  date: string,
  slot: AttendanceSlot,
  at: string,
): Attendance[] {
  const cur = attendanceFor(attendance, date);
  const morning = slot === 'morning' ? true : (cur?.morning ?? false);
  const night = slot === 'night' ? true : (cur?.night ?? false);
  const next: Attendance = { date, morning, night };
  const morningAt = slot === 'morning' ? (cur?.morningAt ?? at) : cur?.morningAt;
  const nightAt = slot === 'night' ? (cur?.nightAt ?? at) : cur?.nightAt;
  if (morning && morningAt) next.morningAt = morningAt;
  if (night && nightAt) next.nightAt = nightAt;
  const others = attendance.filter((a) => a.date !== date);
  return [...others, next];
}

/** Local clock time as HH:MM; empty when the timestamp is missing or unreadable. */
export function clockLabel(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
// stays pending all day; night takes over at 22:00. Once a slot is marked,
// that gate is done for the day.
/** Hour the morning check-in window opens. */
export const MORNING_START_HOUR = 4;
/** Hour the night check-in takes over and the app is gated. */
export const NIGHT_START_HOUR = 22;

/**
 * Which absen screen should block the app right now, if any.
 * Night (22:00+) wins; otherwise morning from 04:00. Night means the
 * morning slot was missed, so it is not retroactively gated.
 */
export function gateFor(
  attendance: Attendance[],
  date: string,
  hour: number,
): AttendanceSlot | null {
  const a = attendanceFor(attendance, date);
  if (hour >= NIGHT_START_HOUR) return a?.night === true ? null : 'night';
  if (hour >= MORNING_START_HOUR) return a?.morning === true ? null : 'morning';
  return null;
}
