/**
 * Day Detail Panel
 * Full-screen takeover for one day picked from the activity calendar: wake and
 * bed times, habits, side quests, the reflection, and XP earned. Previous/next
 * buttons make it usable on a phone where calendar squares are tiny.
 */

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Attendance, Checkin, Habit, Reflection, Task } from '../types';
import { addDays, formatDateShort, formatTanggalID } from '../utils/dates';
import { daySummary } from '../utils/dayDetail';

interface Props {
  date: string;
  today: string;
  habits: Habit[];
  checkins: Checkin[];
  tasks: Task[];
  reflections: Reflection[];
  attendance: Attendance[];
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

/** One-time tile: wake-up or bedtime clock saved by the gate. */
function TimeTile({
  label,
  emoji,
  time,
}: {
  label: string;
  emoji: string;
  time: string;
}): ReactNode {
  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-100/60 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-slate-400">
        <span aria-hidden="true" className="mr-1">
          {emoji}
        </span>
        {label}
      </p>
      {time ? (
        <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums tracking-tight">
          {time}
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">No tap saved</p>
      )}
    </div>
  );
}

/** Checklist row reused for habits and side quests. */
function DoneRow({ done, label }: { done: boolean; label: string }): ReactNode {
  return (
    <li className="flex items-start gap-2 py-2 text-sm">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          done
            ? 'bg-sage-500 text-white dark:bg-emerald-500'
            : 'border border-cream-200 text-transparent dark:border-slate-700'
        }`}
      >
        ✓
      </span>
      <span className={done ? '' : 'text-ink-500 dark:text-slate-400'}>
        <span className="sr-only">{done ? 'Done:' : 'Not done:'} </span>
        {label}
      </span>
    </li>
  );
}

/** Full-screen breakdown of everything logged on one day. */
export function DayDetail({
  date,
  today,
  habits,
  checkins,
  tasks,
  reflections,
  attendance,
  onSelectDate,
  onClose,
}: Props): ReactNode {
  const closeRef = useRef<HTMLButtonElement>(null);
  const summary = useMemo(
    () => daySummary(date, habits, checkins, tasks, reflections, attendance),
    [date, habits, checkins, tasks, reflections, attendance],
  );

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const canGoNext = next <= today;
  const habitLine =
    summary.habits.length === 0
      ? 'No habits were due.'
      : `${summary.habitsDone} of ${summary.habits.length} done`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Day detail for ${date}`}
    >
      <button
        type="button"
        aria-label="Close day detail"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative flex h-full w-full flex-col bg-cream-50 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="section-title text-sage-600 dark:text-emerald-300">Day detail</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {formatTanggalID(date)}
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
              {summary.active
                ? `+${summary.xp} XP that day${summary.habits.length > 0 ? ` · ${habitLine}` : ''}`
                : 'Nothing logged this day.'}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close day detail"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-2">
            <TimeTile label="Wake-up" emoji="🌅" time={summary.wake} />
            <TimeTile label="Bedtime" emoji="🌙" time={summary.bed} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Times come from the “I’m awake — begin” and night taps. Days before times were saved
            stay empty.
          </p>

          <section className="mt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="section-title text-slate-400 dark:text-slate-500">Habits</h3>
              <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
                {habitLine}
              </span>
            </div>
            {summary.habits.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">No habits were due.</p>
            ) : (
              <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
                {summary.habits.map((h) => (
                  <DoneRow key={h.id} done={h.done} label={h.name} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-5 border-t border-cream-200 pt-4 dark:border-slate-800">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="section-title text-slate-400 dark:text-slate-500">Side quests</h3>
              <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
                {summary.questsDone}/{summary.quests.length} done
              </span>
            </div>
            {summary.quests.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">No side quests.</p>
            ) : (
              <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
                {summary.quests.map((q) => (
                  <DoneRow key={q.id} done={q.done} label={q.title} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-5 border-t border-cream-200 pt-4 dark:border-slate-800">
            <h3 className="section-title text-slate-400 dark:text-slate-500">Reflection</h3>
            {summary.reflection ? (
              <div className="mt-2 text-sm">
                <p className="text-ink-500 tabular-nums dark:text-slate-400">
                  Mood {summary.reflection.mood ?? '—'}/5 · Energy{' '}
                  {summary.reflection.energy ?? '—'}/5
                </p>
                {summary.reflection.wentWell ? (
                  <p className="mt-1 leading-relaxed">{summary.reflection.wentWell}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
                No reflection this day.
              </p>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-cream-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onSelectDate(prev)}
            className="flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">←</span>
            <span className="max-sm:hidden">{formatDateShort(prev)}</span>
            <span className="sm:hidden">Previous</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(next)}
            disabled={!canGoNext}
            className="flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold hover:bg-cream-200/70 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
          >
            <span className="max-sm:hidden">{canGoNext ? formatDateShort(next) : 'Latest'}</span>
            <span className="sm:hidden">Next</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
