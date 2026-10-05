import { useEffect, useRef, useState, type ReactNode } from 'react';

const FOCUS = 25 * 60;
const REST = 5 * 60;

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function Pomodoro({ focusTitle }: { focusTitle: string }): ReactNode {
  const [seconds, setSeconds] = useState(FOCUS);
  const [mode, setMode] = useState<'fokus' | 'istirahat'>('fokus');
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode === 'fokus') {
            setMode('istirahat');
            return REST;
          }
          setMode('fokus');
          return FOCUS;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running, mode]);

  const reset = (m: 'fokus' | 'istirahat'): void => {
    setRunning(false);
    setMode(m);
    setSeconds(m === 'fokus' ? FOCUS : REST);
  };

  return (
    <section aria-label="Pomodoro timer" className="rounded-3xl bg-sage-100/60 p-8 text-center dark:bg-slate-800/60">
      <h2 className="section-title text-slate-500 dark:text-slate-400">🍅 Pomodoro 25 / 5</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Focusing on <span className="font-semibold text-slate-700 dark:text-slate-200">{focusTitle || '— pick a task above'}</span>
      </p>
      <p className="mt-4 text-7xl font-extrabold tabular-nums tracking-tight" aria-live="polite">
        {fmt(seconds)}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {mode === 'fokus' ? 'Focus time — one thing only.' : 'Break time — stretch, water, breathe.'}
      </p>
      <div className="mx-auto mt-5 flex max-w-xs gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="min-h-[48px] flex-1 rounded-full bg-slate-800 px-4 font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => reset('fokus')}
          aria-label="Reset to 25 minutes focus"
          className="min-h-[48px] min-w-[48px] rounded-full border border-slate-300 text-sm font-semibold dark:border-slate-600"
        >
          25′
        </button>
        <button
          type="button"
          onClick={() => reset('istirahat')}
          aria-label="Reset to 5 minutes break"
          className="min-h-[48px] min-w-[48px] rounded-full border border-slate-300 text-sm font-semibold dark:border-slate-600"
        >
          5′
        </button>
      </div>
    </section>
  );
}
