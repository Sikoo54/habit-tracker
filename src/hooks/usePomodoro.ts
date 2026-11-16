/**
 * Pomodoro Hook
 * Owns the persisted timer state, ticks the display from an end timestamp, and
 * resyncs when the tab becomes visible again after being backgrounded.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  pausePomodoro,
  readPomodoro,
  reconcilePomodoro,
  remainingFrom,
  resetPomodoro,
  savePomodoro,
  startPomodoro,
  type PomodoroMode,
  type PomodoroState,
} from '../utils/pomodoro';

/** Persisted 25/5 timer with start, pause, and reset actions. */
export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(readPomodoro);
  // Actions and the tick read the latest committed state, not a stale render.
  const stateRef = useRef(state);

  /** Commits a transition and persists it immediately. */
  const commit = useCallback((next: PomodoroState): void => {
    stateRef.current = next;
    savePomodoro(next);
    setState(next);
  }, []);

  useEffect(() => {
    if (!state.running || state.endsAt === null) return;

    // The clock is the source of truth; this only refreshes the visible number.
    const tick = (): void => {
      const at = Date.now();
      const current = stateRef.current;
      const next = reconcilePomodoro(current, at);
      if (next !== current) {
        commit(next);
        return;
      }
      const remaining = remainingFrom(current, at);
      if (remaining !== current.remaining) {
        const updated = { ...current, remaining };
        stateRef.current = updated;
        setState(updated);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', tick);
    window.addEventListener('pageshow', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', tick);
      window.removeEventListener('pageshow', tick);
    };
  }, [state.running, state.endsAt, commit]);

  const start = (): void => {
    const at = Date.now();
    commit(startPomodoro(reconcilePomodoro(stateRef.current, at), at));
  };

  const pause = (): void => {
    const at = Date.now();
    commit(pausePomodoro(reconcilePomodoro(stateRef.current, at), at));
  };

  const reset = (mode: PomodoroMode): void => {
    commit(resetPomodoro(mode));
  };

  return {
    mode: state.mode,
    running: state.running,
    seconds: remainingFrom(state),
    start,
    pause,
    reset,
  };
}
