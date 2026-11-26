/**
 * Goals Panel
 * Full-screen editor for the long-range goals: add a goal, edit one in place,
 * or remove it with a confirmation. Closing returns to the goals card.
 */

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { MAX_GOALS, type useGoals } from '../hooks/useGoals';
import type { Goal, GoalInput } from '../types';
import { formatGoalDate, goalDeadlineLabel } from '../utils/goals';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

interface Props {
  goalsApi: ReturnType<typeof useGoals>;
  todayKey: string;
  onClose: () => void;
  /** Optional title to prefill in the add form when starting from an example. */
  starterTitle?: string;
}

/** Shared field styling for the add and edit forms. */
const inputCls =
  'min-h-[44px] w-full rounded-xl border border-cream-200 bg-cream-50 px-3 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/**
 * Goal form used for both adding and editing. Keeps its own draft so cancel
 * never touches the saved goal.
 */
function GoalForm({
  initial,
  initialTitle,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Goal;
  initialTitle?: string;
  submitLabel: string;
  onSubmit: (input: GoalInput) => { ok: boolean; reason?: string };
  onCancel?: () => void;
}): ReactNode {
  const [title, setTitle] = useState(initial?.title ?? initialTitle ?? '');
  const [why, setWhy] = useState(initial?.why ?? '');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const result = onSubmit({ title, why, targetDate });
    if (!result.ok) {
      setError(result.reason ?? 'Could not save this goal.');
      return;
    }
    setError(null);
    if (!initial) {
      setTitle('');
      setWhy('');
      setTargetDate('');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={initial ? 'Edit goal' : 'Add a goal'}>
      <div>
        <label
          htmlFor={`goal-title-${initial?.id ?? 'new'}`}
          className="text-xs font-semibold text-ink-500 dark:text-slate-400"
        >
          Goal
        </label>
        <input
          id={`goal-title-${initial?.id ?? 'new'}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you climbing toward?"
          maxLength={80}
          className={inputCls}
        />
      </div>
      <div>
        <label
          htmlFor={`goal-why-${initial?.id ?? 'new'}`}
          className="text-xs font-semibold text-ink-500 dark:text-slate-400"
        >
          Why it matters
        </label>
        <textarea
          id={`goal-why-${initial?.id ?? 'new'}`}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="One sentence you want to read on a hard day."
          maxLength={160}
          rows={2}
          className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label
          htmlFor={`goal-date-${initial?.id ?? 'new'}`}
          className="text-xs font-semibold text-ink-500 dark:text-slate-400"
        >
          Target date — optional
        </label>
        <input
          id={`goal-date-${initial?.id ?? 'new'}`}
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className={inputCls}
        />
      </div>
      {error ? (
        <p role="alert" className="text-[13px] text-amber-700 dark:text-amber-300">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-[44px] flex-1 rounded-xl bg-sage-600 px-3 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {submitLabel}
        </button>
        {initial ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-cream-300 px-4 text-sm dark:border-slate-600"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

/** Panel that lets the user write and maintain their goals. */
export function GoalsPanel({ goalsApi, todayKey, onClose, starterTitle }: Props): ReactNode {
  const { goals, addGoal, updateGoal, removeGoal, toggleGoalStar } = goalsApi;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      // The confirm dialog owns Escape while it is open.
      if (e.key === 'Escape' && !confirmingId) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, confirmingId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const confirmingGoal = confirmingId ? goals.find((goal) => goal.id === confirmingId) : undefined;
  const full = goals.length >= MAX_GOALS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Goals"
    >
      <button
        type="button"
        aria-label="Close goals"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative flex h-full w-full flex-col bg-cream-50 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="section-title text-amber-700 dark:text-amber-300">Motivation</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Your goals
              <span className="ml-2 text-base font-medium text-slate-400 tabular-nums">
                {goals.length}
              </span>
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
              Write what the climb is for. Star any goal to show it big on the Goals page — as many as
              you like.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close goals"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {full ? (
            <p
              role="status"
              className="mb-3 rounded-xl bg-cream-100 px-3 py-2 text-sm font-medium text-ink-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {MAX_GOALS} goals is the limit. Remove one to write another.
            </p>
          ) : (
            <div className="mb-4 rounded-2xl border border-cream-200 bg-cream-100/50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <GoalForm
                submitLabel={goals.length === 0 ? 'Save first goal' : 'Add goal'}
                initialTitle={starterTitle}
                onSubmit={addGoal}
              />
            </div>
          )}

          {goals.length === 0 ? (
            <EmptyState
              icon="🎯"
              message="No goals yet."
              hint="Write one clear goal above. It will greet you here."
            />
          ) : (
            <ul className="space-y-3">
              {goals.map((goal) => {
                const date = formatGoalDate(goal.targetDate);
                const countdown = goalDeadlineLabel(goal.targetDate, todayKey);

                return (
                  <li
                    key={goal.id}
                    className="rounded-2xl border border-cream-200 bg-cream-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                  >
                    {editingId === goal.id ? (
                      <GoalForm
                        initial={goal}
                        submitLabel="Save goal"
                        onSubmit={(input) => {
                          const result = updateGoal(goal.id, input);
                          if (result.ok) setEditingId(null);
                          return result;
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 text-base font-semibold">{goal.title}</p>
                          {date ? (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 tabular-nums dark:bg-amber-950 dark:text-amber-200">
                              {date}
                              {countdown ? ` · ${countdown}` : ''}
                            </span>
                          ) : null}
                        </div>
                        {goal.why ? (
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-500 dark:text-slate-400">
                            {goal.why}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-stretch gap-2">
                          <button
                            type="button"
                            onClick={() => toggleGoalStar(goal.id)}
                            aria-pressed={Boolean(goal.starred)}
                            aria-label={
                              goal.starred
                                ? `Stop featuring "${goal.title}"`
                                : `Feature "${goal.title}"`
                            }
                            title={
                              goal.starred
                                ? 'Featured big on the Goals page'
                                : 'Show this goal big on the Goals page'
                            }
                            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border text-lg ${
                              goal.starred
                                ? 'border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'border-cream-300 text-ink-500 hover:bg-cream-100 hover:text-summit-600 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-300'
                            }`}
                          >
                            <span aria-hidden="true">★</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(goal.id)}
                            className="min-h-[44px] flex-1 rounded-xl border border-cream-300 px-3 text-sm font-medium hover:bg-cream-100 dark:border-slate-600 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(goal.id)}
                            className="min-h-[44px] flex-1 rounded-xl border border-red-300 px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {confirmingGoal ? (
        <ConfirmDialog
          tone="danger"
          title={`Remove "${confirmingGoal.title}"?`}
          description="It disappears from your goals. Habits, check-ins, and XP are not touched."
          confirmLabel="Remove goal"
          onConfirm={() => {
            removeGoal(confirmingGoal.id);
            setConfirmingId(null);
            setEditingId(null);
          }}
          onCancel={() => setConfirmingId(null)}
        />
      ) : null}
    </div>
  );
}
