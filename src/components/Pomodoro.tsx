/**
 * Pomodoro Timer Component
 * 25-minute focus work interval followed by a 5-minute rest period,
 * with start, pause, and reset controls.
 */

import type { ReactNode } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** 25/5 Pomodoro timer widget */
export function Pomodoro({ focusTitle }: { focusTitle: string }): ReactNode {
  const { mode, seconds, running, start, pause, reset } = usePomodoro();

  return (
    <section
      aria-label="Pomodoro timer"
      className="relative overflow-hidden rounded-3xl border border-sage-200/80 border-l-4 border-l-sage-500 bg-gradient-to-br from-sage-50/80 via-cream-50 to-cream-50 p-8 text-center max-sm:p-5 dark:border-slate-700 dark:border-l-emerald-500 dark:from-emerald-950/20 dark:via-slate-900/50 dark:to-slate-900/40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-sage-300/30 dark:border-emerald-800/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-sage-300/20 dark:border-emerald-800/20"
      />
      <h2 className="section-title relative text-sage-600 dark:text-emerald-300">Pomodoro 25 / 5</h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
        Focusing on{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {focusTitle || '— pick a task above'}
        </span>
      </p>
      <p
        className="mt-4 text-7xl font-extrabold tabular-nums tracking-tight max-sm:text-6xl"
        aria-live="polite"
      >
        {fmt(seconds)}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {mode === 'focus'
          ? 'Focus time — one thing only.'
          : 'Break time — stretch, water, breathe.'}
      </p>
      <div className="mx-auto mt-5 flex max-w-xs gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="min-h-[48px] flex-1 rounded-full bg-sage-600 px-4 font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => reset('focus')}
          aria-label="Reset to 25 minutes focus"
          className="min-h-[48px] min-w-[48px] rounded-full border border-cream-300 text-sm font-semibold dark:border-slate-600"
        >
          25′
        </button>
        <button
          type="button"
          onClick={() => reset('break')}
          aria-label="Reset to 5 minutes break"
          className="min-h-[48px] min-w-[48px] rounded-full border border-cream-300 text-sm font-semibold dark:border-slate-600"
        >
          5′
        </button>
      </div>
      <div className="mx-auto mt-8 max-w-xs border-t border-sage-600/15 pt-5 dark:border-slate-700">
        <p className="text-sm text-ink-500 dark:text-slate-400">
          🎧 Try to focus with cozy lofi hiphop songs?
        </p>
        <a
          href="https://sikozy.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-cream-300 px-4 text-sm font-semibold hover:bg-cream-200/60 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">▶</span> Open Sikozy Lofi
        </a>
      </div>
    </section>
  );
}
