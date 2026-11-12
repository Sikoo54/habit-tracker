/**
 * Archived Habits Panel
 * Full-screen takeover listing retired habits. A habit can be restored to the
 * board or permanently deleted with an explicit warning about its history.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { xpForCheckin } from '../game/xp';
import type { Checkin, Habit } from '../types';
import { formatTanggalID, toDateKey } from '../utils/dates';
import { EmptyState } from './EmptyState';

interface Props {
  habits: Habit[];
  checkins: Checkin[];
  onRestore: (id: string) => { ok: boolean; reason?: string };
  onDelete: (id: string) => void;
  onClose: () => void;
}

/** Date label for an archived habit, tolerant of old/corrupt timestamps. */
function archivedLabel(habit: Habit): string {
  if (!habit.archivedAt) return 'Archived';
  const date = new Date(habit.archivedAt);
  if (Number.isNaN(date.getTime())) return 'Archived';
  return `Archived ${formatTanggalID(toDateKey(date))}`;
}

/** Panel that lets the user restore or permanently delete archived habits. */
export function ArchivedHabits({
  habits,
  checkins,
  onRestore,
  onDelete,
  onClose,
}: Props): ReactNode {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sorted = [...habits].sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));

  const restore = (id: string): void => {
    const result = onRestore(id);
    setError(result.ok ? null : (result.reason ?? 'Could not restore this habit.'));
    if (result.ok) setConfirmingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Archived habits"
    >
      <button
        type="button"
        aria-label="Close archived habits"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative flex h-full w-full flex-col bg-cream-50 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="section-title text-sage-600 dark:text-emerald-300">Retired routes</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Archived habits
              <span className="ml-2 text-base font-medium text-slate-400 tabular-nums">
                {sorted.length}
              </span>
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
              Restore one to put it back on today&apos;s board. Deleting forever also removes its
              check-ins, so past stats can change.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close archived habits"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              {error}
            </p>
          ) : null}

          {sorted.length === 0 ? (
            <EmptyState
              icon="🗂️"
              message="No archived habits."
              hint="Habits you archive from the Main Quest will wait here."
            />
          ) : (
            <ul className="space-y-3">
              {sorted.map((habit) => {
                const count = checkins.filter((c) => c.habitId === habit.id).length;
                const xp = count * xpForCheckin();
                const confirming = confirmingId === habit.id;
                const meta = [
                  habit.fullVersion && habit.fullVersion !== habit.name ? habit.fullVersion : '',
                  habit.trigger ? `⏰ ${habit.trigger}` : '',
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <li
                    key={habit.id}
                    className="rounded-2xl border border-cream-200 bg-cream-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold">{habit.name}</p>
                        {meta ? (
                          <p className="mt-0.5 truncate text-[13px] text-ink-500 dark:text-slate-400">
                            {meta}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-400">
                          {archivedLabel(habit)} · {count} {count === 1 ? 'check-in' : 'check-ins'}
                        </p>
                      </div>
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:bg-slate-800 dark:text-slate-300">
                        Archived
                      </span>
                    </div>

                    {confirming ? (
                      <div
                        role="alertdialog"
                        aria-label={`Delete ${habit.name} forever`}
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/60"
                      >
                        <p className="text-sm font-bold text-red-800 dark:text-red-200">
                          Delete &quot;{habit.name}&quot; forever?
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-red-800/90 dark:text-red-200/90">
                          {count > 0
                            ? `This removes ${count} ${count === 1 ? 'check-in' : 'check-ins'} (${xp} XP) and can change past stats, streaks, and achievements.`
                            : 'This habit has no check-ins, so your stats will not change.'}{' '}
                          It cannot be undone.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(habit.id);
                              setConfirmingId(null);
                              setError(null);
                            }}
                            className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Yes, delete forever
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="min-h-[44px] flex-1 rounded-xl border border-red-300 px-3 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => restore(habit.id)}
                          className="min-h-[44px] flex-1 rounded-xl bg-sage-600 px-3 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingId(habit.id);
                            setError(null);
                          }}
                          className="min-h-[44px] flex-1 rounded-xl border border-red-300 px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Delete forever
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
