/**
 * Pomodoro Timer State
 * Persists the 25/5 timer across refreshes and tab switches. Running sessions
 * store an end timestamp, so remaining time is recalculated from the clock
 * instead of drifting with a throttled interval.
 */

import { isRecord } from '../storage/validation';

export const POMODORO_KEY = 'habittracker.v2.pomodoro';

/** Work interval duration in seconds. */
export const FOCUS_SECONDS = 25 * 60;

/** Rest interval duration in seconds. */
export const BREAK_SECONDS = 5 * 60;

export type PomodoroMode = 'focus' | 'break';

export interface PomodoroState {
  version: 1;
  mode: PomodoroMode;
  running: boolean;
  /** Epoch ms when the current run ends; null while paused/reset. */
  endsAt: number | null;
  /** Seconds left while paused/reset. */
  remaining: number;
}

/** Full duration for a mode. */
export function durationFor(mode: PomodoroMode): number {
  return mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
}

/** Fresh paused timer for a mode. */
export function defaultPomodoro(mode: PomodoroMode = 'focus'): PomodoroState {
  return {
    version: 1,
    mode,
    running: false,
    endsAt: null,
    remaining: durationFor(mode),
  };
}

/** Saved seconds, clamped to the mode's duration and never negative. */
function clampRemaining(seconds: number, mode: PomodoroMode): number {
  return Math.max(0, Math.min(durationFor(mode), Math.round(seconds)));
}

/** Seconds left right now, derived from the saved end timestamp. */
export function remainingFrom(state: PomodoroState, now: number = Date.now()): number {
  if (state.running && state.endsAt !== null) {
    return clampRemaining(Math.ceil((state.endsAt - now) / 1000), state.mode);
  }
  return clampRemaining(state.remaining, state.mode);
}

/** Starts or resumes the timer from its current remaining seconds. */
export function startPomodoro(state: PomodoroState, now: number = Date.now()): PomodoroState {
  const left = remainingFrom(state, now);
  const seconds = left > 0 ? left : durationFor(state.mode);
  return {
    ...state,
    running: true,
    endsAt: now + seconds * 1000,
    remaining: seconds,
  };
}

/** Pauses the timer and keeps the exact seconds left. */
export function pausePomodoro(state: PomodoroState, now: number = Date.now()): PomodoroState {
  return {
    ...state,
    running: false,
    endsAt: null,
    remaining: remainingFrom(state, now),
  };
}

/** Stops the timer and resets it to a full focus or break interval. */
export function resetPomodoro(mode: PomodoroMode): PomodoroState {
  return defaultPomodoro(mode);
}

/**
 * Moves to the next mode when a run has ended. The next interval waits paused,
 * so reopening the app never starts a session without the user's tap.
 */
export function reconcilePomodoro(state: PomodoroState, now: number = Date.now()): PomodoroState {
  if (!state.running || state.endsAt === null || now < state.endsAt) return state;
  return defaultPomodoro(state.mode === 'focus' ? 'break' : 'focus');
}

/** Reads and validates the saved timer, falling back to a fresh focus interval. */
export function readPomodoro(): PomodoroState {
  try {
    const raw = window.localStorage.getItem(POMODORO_KEY);
    if (!raw) return defaultPomodoro();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) return defaultPomodoro();

    const mode: PomodoroMode = parsed.mode === 'break' ? 'break' : 'focus';
    const remaining =
      typeof parsed.remaining === 'number' && Number.isFinite(parsed.remaining)
        ? clampRemaining(parsed.remaining, mode)
        : durationFor(mode);
    const hasEnd = typeof parsed.endsAt === 'number' && Number.isFinite(parsed.endsAt);
    const running = parsed.running === true && hasEnd;

    return {
      version: 1,
      mode,
      running,
      endsAt: running ? (parsed.endsAt as number) : null,
      remaining,
    };
  } catch {
    return defaultPomodoro();
  }
}

/** Writes the timer state. Failures are non-fatal, like other local writes. */
export function savePomodoro(state: PomodoroState): void {
  try {
    window.localStorage.setItem(POMODORO_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota: the in-memory timer keeps running for this visit.
  }
}
