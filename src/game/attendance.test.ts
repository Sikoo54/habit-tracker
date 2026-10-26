/**
 * Attendance System Test Suite
 * Tests attendance slot toggles, morning/night hour gating logic,
 * XP calculations, and active dates extraction.
 */

import { describe, expect, it } from 'vitest';
import type { Attendance } from '../types';
import { attendedDates, attendanceFor, attendanceXp, gateFor, toggleAttendance } from './attendance';

const day = (date: string, morning = false, night = false): Attendance => ({ date, morning, night });

describe('attendance xp', () => {
  it('gives 5 per marked slot', () => {
    expect(attendanceXp([])).toBe(0);
    expect(attendanceXp([day('2026-10-20', true, false)])).toBe(5);
    expect(attendanceXp([day('2026-10-20', true, true)])).toBe(10);
    expect(attendanceXp([day('2026-10-19', true, true), day('2026-10-20', false, true)])).toBe(15);
  });
});

describe('toggleAttendance', () => {
  it('creates the row on first mark', () => {
    const next = toggleAttendance([], '2026-10-20', 'morning');
    expect(next).toEqual([{ date: '2026-10-20', morning: true, night: false }]);
  });

  it('adds the other slot without touching the first', () => {
    let list = toggleAttendance([], '2026-10-20', 'morning');
    list = toggleAttendance(list, '2026-10-20', 'night');
    expect(attendanceFor(list, '2026-10-20')).toEqual({ date: '2026-10-20', morning: true, night: true });
  });

  it('unmarks a slot', () => {
    const start = [day('2026-10-20', true, false)];
    expect(toggleAttendance(start, '2026-10-20', 'morning')).toEqual([]);
  });

  it('drops the row when both slots are off', () => {
    const start = [day('2026-10-20', false, true), day('2026-10-19', false, true)];
    const next = toggleAttendance(start, '2026-10-20', 'night');
    expect(next.map((a) => a.date)).toEqual(['2026-10-19']);
  });

  it('never touches other days', () => {
    const start = [day('2026-10-19', true, false), day('2026-10-20', false, false)];
    const next = toggleAttendance(start, '2026-10-20', 'morning');
    expect(attendanceFor(next, '2026-10-19')?.morning).toBe(true);
    expect(attendanceFor(next, '2026-10-20')?.morning).toBe(true);
  });
});

describe('attendedDates', () => {
  it('includes only days with at least one slot', () => {
    const dates = attendedDates([day('2026-10-20', true, false), day('2026-10-19', false, false)]);
    expect(dates).toEqual(new Set(['2026-10-20']));
  });
});

describe('gateFor', () => {
  it('opens the morning gate from 04:00 and keeps it all day', () => {
    expect(gateFor([], '2026-10-20', 3)).toBeNull();
    expect(gateFor([], '2026-10-20', 4)).toBe('morning');
    expect(gateFor([], '2026-10-20', 9)).toBe('morning');
    expect(gateFor([], '2026-10-20', 12)).toBe('morning');
    expect(gateFor([], '2026-10-20', 19)).toBe('morning');
  });

  it('opens the night gate from 22:00', () => {
    expect(gateFor([], '2026-10-20', 20)).toBe('morning');
    expect(gateFor([], '2026-10-20', 21)).toBe('morning');
    expect(gateFor([], '2026-10-20', 22)).toBe('night');
    expect(gateFor([], '2026-10-20', 23)).toBe('night');
  });

  it('stops gating once the slot is marked', () => {
    const done = [day('2026-10-20', true, true)];
    expect(gateFor(done, '2026-10-20', 6)).toBeNull();
    expect(gateFor(done, '2026-10-20', 22)).toBeNull();
  });

  it('morning and night gates are independent', () => {
    const morningOnly = [day('2026-10-20', true, false)];
    expect(gateFor(morningOnly, '2026-10-20', 6)).toBeNull();
    expect(gateFor(morningOnly, '2026-10-20', 18)).toBeNull();
    expect(gateFor(morningOnly, '2026-10-20', 21)).toBeNull();
    expect(gateFor(morningOnly, '2026-10-20', 22)).toBe('night');
    const nightOnly = [day('2026-10-20', false, true)];
    expect(gateFor(nightOnly, '2026-10-20', 6)).toBe('morning');
    expect(gateFor(nightOnly, '2026-10-20', 22)).toBeNull();
  });
});
