/**
 * Pomodoro State Test Suite
 * Covers timestamp-based countdowns, pause/resume math, expiry transitions,
 * and localStorage round-trips for the persisted timer.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  BREAK_SECONDS,
  defaultPomodoro,
  durationFor,
  FOCUS_SECONDS,
  pausePomodoro,
  POMODORO_KEY,
  readPomodoro,
  reconcilePomodoro,
  remainingFrom,
  resetPomodoro,
  savePomodoro,
  startPomodoro,
} from './pomodoro';

const NOW = Date.UTC(2026, 10, 16, 9, 0, 0);

describe('pomodoro state', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to a full focus interval', () => {
    expect(defaultPomodoro()).toEqual({
      version: 1,
      mode: 'focus',
      running: false,
      endsAt: null,
      remaining: FOCUS_SECONDS,
    });
    expect(durationFor('break')).toBe(BREAK_SECONDS);
  });

  it('derives remaining time from the end timestamp', () => {
    const running = startPomodoro(defaultPomodoro(), NOW);
    expect(running.endsAt).toBe(NOW + FOCUS_SECONDS * 1000);
    expect(remainingFrom(running, NOW + 60_000)).toBe(FOCUS_SECONDS - 60);
  });

  it('never reports negative time and caps clock skew at the duration', () => {
    const running = startPomodoro(defaultPomodoro(), NOW);
    expect(remainingFrom(running, NOW + 60 * 60 * 1000)).toBe(0);
    expect(remainingFrom(running, NOW - 60 * 60 * 1000)).toBe(FOCUS_SECONDS);
  });

  it('pauses at the exact seconds left and resumes from there', () => {
    const running = startPomodoro(defaultPomodoro(), NOW);
    const paused = pausePomodoro(running, NOW + 90_000);
    expect(paused.running).toBe(false);
    expect(paused.endsAt).toBeNull();
    expect(paused.remaining).toBe(FOCUS_SECONDS - 90);

    const resumed = startPomodoro(paused, NOW + 10 * 60 * 1000);
    expect(resumed.running).toBe(true);
    expect(resumed.endsAt).toBe(NOW + 10 * 60 * 1000 + (FOCUS_SECONDS - 90) * 1000);
  });

  it('moves to a paused next mode when a run expires', () => {
    const focus = startPomodoro(defaultPomodoro(), NOW);
    const expiredFocus = reconcilePomodoro(focus, NOW + FOCUS_SECONDS * 1000);
    expect(expiredFocus).toEqual(defaultPomodoro('break'));

    const rest = startPomodoro(defaultPomodoro('break'), NOW);
    expect(reconcilePomodoro(rest, NOW + BREAK_SECONDS * 1000)).toEqual(defaultPomodoro('focus'));
  });

  it('leaves a live run untouched', () => {
    const running = startPomodoro(defaultPomodoro(), NOW);
    expect(reconcilePomodoro(running, NOW + 1_000)).toBe(running);
  });

  it('resets either mode to a full paused interval', () => {
    expect(resetPomodoro('focus')).toEqual(defaultPomodoro('focus'));
    expect(resetPomodoro('break')).toEqual(defaultPomodoro('break'));
  });

  it('round-trips through localStorage', () => {
    const running = startPomodoro(defaultPomodoro('break'), NOW);
    savePomodoro(running);
    expect(readPomodoro()).toEqual(running);
  });

  it('falls back safely for missing, corrupt, or unknown data', () => {
    expect(readPomodoro()).toEqual(defaultPomodoro());

    window.localStorage.setItem(POMODORO_KEY, 'not-json');
    expect(readPomodoro()).toEqual(defaultPomodoro());

    window.localStorage.setItem(POMODORO_KEY, JSON.stringify({ version: 2 }));
    expect(readPomodoro()).toEqual(defaultPomodoro());

    window.localStorage.setItem(
      POMODORO_KEY,
      JSON.stringify({ version: 1, mode: 'break', running: true, endsAt: 'nope', remaining: 30 }),
    );
    expect(readPomodoro()).toEqual({
      version: 1,
      mode: 'break',
      running: false,
      endsAt: null,
      remaining: 30,
    });
  });
});
