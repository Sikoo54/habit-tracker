/**
 * Habit Detail Overlay
 * Full-screen 30-day history for one habit: a calendar of done, missed, late,
 * and not-due days plus the totals behind those cells.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import type { Checkin, Habit } from '../types';
import {
  formatTanggalID,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
  todayKey,
} from '../utils/dates';
import { habitHistory, type HabitHistoryDay } from '../utils/habitHistory';
import { EmptyState } from './EmptyState';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  habit: Habit;
  checkins: Checkin[];
  onClose: () => void;
}

/** Cell colour for one day, matching the legend below the calendar. */
function cellClass(day: HabitHistoryDay): string {
  if (!day.due) {
    return 'border border-dashed border-cream-200 text-slate-300 dark:border-slate-700 dark:text-slate-600';
  }
  if (day.done) {
    return day.late
      ? 'bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-500/40 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800'
      : 'bg-sage-600 text-white dark:bg-emerald-600';
  }
  if (day.isToday) {
    return 'bg-cream-100 text-ink-700 ring-2 ring-inset ring-sage-500/50 dark:bg-slate-800 dark:text-slate-100 dark:ring-emerald-700';
  }
  return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900';
}

/** Short symbol inside a day cell. */
function cellMark(day: HabitHistoryDay): string {
  if (!day.due) return '';
  if (day.done) return day.late ? '✓*' : '✓';
  if (day.missed) return '✕';
  if (day.isToday) return '•';
  return '';
}

/** Human status used by the cell tooltip and screen readers. */
function dayStatus(day: HabitHistoryDay): string {
  if (!day.due) return 'Not due';
  if (day.done) return day.late ? 'Done late' : 'Done';
  if (day.isToday) return 'Due today';
  return 'Missed';
}

/** Calendar + summary takeover for one habit's recent history. */
export function HabitDetail({ habit, checkins, onClose }: Props): ReactNode {
  const closeRef = useRef<HTMLButtonElement>(null);
  const today = todayKey();
  const history = habitHistory(habit, checkins, today);
  const { days, summary } = history;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Align the first visible day to Monday so the grid reads like a calendar.
  const first = days[0]?.date ?? today;
  const lead = Math.round(
    (parseDateKey(first).getTime() - parseDateKey(startOfWeekMonday(first)).getTime()) / 86_400_000,
  );
  const missed = days.filter((day) => day.missed).reverse();
  const late = days.filter((day) => day.late).reverse();
  const totalCheckins = checkins.filter((c) => c.habitId === habit.id).length;
  const created = new Date(habit.createdAt);
  const started = Number.isNaN(created.getTime()) ? null : formatTanggalID(toDateKey(created));

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${habit.name} 30-day history`}
    >
      <button
        type="button"
        aria-label="Close habit history"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative flex h-full w-full flex-col bg-cream-50 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="section-title text-sage-600 dark:text-emerald-300">Habit history</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
              <span className="truncate">{habit.name}</span>
              {habit.archivedAt ? (
                <span className="shrink-0 rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-600 dark:bg-slate-800 dark:text-slate-300">
                  Archived
                </span>
              ) : null}
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
              {started ? `Started ${started} · ` : ''}
              {totalCheckins} {totalCheckins === 1 ? 'check-in' : 'check-ins'} all time
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close habit history"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {summary.due === 0 ? (
            <EmptyState
              icon="🗓️"
              message="No due days in this window."
              hint="This habit was created or archived outside the last 30 days."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SummaryTile label="Done" value={String(summary.done)} tone="sage" />
                <SummaryTile label="Missed" value={String(summary.missed)} tone="red" />
                <SummaryTile label="Late" value={String(summary.late)} tone="amber" />
                <SummaryTile label="Completion" value={`${summary.rate}%`} tone="plain" />
              </div>

              <h3 className="section-title mt-6 text-slate-400 dark:text-slate-500">
                Last 30 days
              </h3>
              <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="30-day habit calendar">
                {WEEKDAYS.map((day) => (
                  <span
                    key={day}
                    className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    {day}
                  </span>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`lead-${i}`} aria-hidden="true" />
                ))}
                {days.map((day) => (
                  <span
                    key={day.date}
                    title={`${formatTanggalID(day.date)} — ${dayStatus(day)}`}
                    className={`flex h-10 flex-col items-center justify-center rounded-xl text-[11px] font-semibold tabular-nums ${cellClass(day)}`}
                  >
                    <span>{parseDateKey(day.date).getDate()}</span>
                    <span aria-hidden="true" className="text-[10px] leading-none">
                      {cellMark(day)}
                    </span>
                    <span className="sr-only">
                      {formatTanggalID(day.date)}: {dayStatus(day)}
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-ink-500 dark:text-slate-400">
                <span className="font-semibold">✓</span> done ·{' '}
                <span className="font-semibold">✓*</span> late ·{' '}
                <span className="font-semibold">✕</span> missed · dashed = not due
              </p>

              <section className="mt-6">
                <div className="flex items-baseline justify-between gap-3 border-t border-cream-200 pt-5 dark:border-slate-800">
                  <h3 className="section-title text-slate-400 dark:text-slate-500">Missed days</h3>
                  <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
                    {missed.length}
                  </span>
                </div>
                {missed.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
                    No missed days in this window. Clean board.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
                    {missed.map((day) => (
                      <li
                        key={day.date}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <span>{formatTanggalID(day.date)}</span>
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-200">
                          Missed
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {late.length > 0 ? (
                <section className="mt-6">
                  <div className="flex items-baseline justify-between gap-3 border-t border-cream-200 pt-5 dark:border-slate-800">
                    <h3 className="section-title text-slate-400 dark:text-slate-500">
                      Late check-ins
                    </h3>
                    <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
                      {late.length}
                    </span>
                  </div>
                  <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
                    {late.map((day) => (
                      <li
                        key={day.date}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <span>{formatTanggalID(day.date)}</span>
                        <span className="shrink-0 text-xs text-amber-700 tabular-nums dark:text-amber-300">
                          {day.loggedDate
                            ? `Logged ${formatTanggalID(day.loggedDate)}`
                            : 'Logged later'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SummaryTileProps {
  label: string;
  value: string;
  tone: 'sage' | 'red' | 'amber' | 'plain';
}

const TILE_CLS = {
  sage: 'bg-sage-50 text-sage-700 dark:bg-emerald-950/60 dark:text-emerald-200',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-200',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
  plain: 'bg-cream-100 text-ink-700 dark:bg-slate-800 dark:text-slate-100',
} as const;

/** One compact number tile above the calendar. */
function SummaryTile({ label, value, tone }: SummaryTileProps): ReactNode {
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${TILE_CLS[tone]}`}>
      <p className="text-lg font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}
