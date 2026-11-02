/**
 * Habit Card Component
 * Interactive Main Quest row: one tap marks the habit done, with streak,
 * risk warning, weekly goal chip, and inline edit dialog. Target and trigger
 * share a single meta line so ten habits stay a short scroll.
 */

import { useState, type FormEvent, type ReactNode } from 'react';
import { xpForCheckin } from '../game/xp';
import { goalProgress } from '../game/weeklyGoals';
import type { Checkin, Habit, HabitInput } from '../types';
import { calculateStreak, isStreakAtRisk, showsStreak, streakMessage } from '../utils/streak';

interface Props {
  habit: Habit;
  completedDates: string[];
  checkins: Checkin[];
  weekMonday: string;
  todayKey: string;
  checked: boolean;
  onToggle: () => void;
  onUpdate: (input: HabitInput) => { ok: boolean; reason?: string };
  onRemove: () => void;
}

const inputCls =
  'min-h-[44px] w-full rounded-xl border border-cream-200 bg-cream-50 px-3 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/** Individual habit list card item */
export function HabitCard({ habit, completedDates, checkins, weekMonday, todayKey, checked, onToggle, onUpdate, onRemove }: Props): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [full, setFull] = useState(habit.fullVersion);
  const [trigger, setTrigger] = useState(habit.trigger);
  const [weeklyGoal, setWeeklyGoal] = useState(habit.weeklyGoal);
  const [error, setError] = useState<string | null>(null);
  const streak = calculateStreak(completedDates, todayKey);
  const atRisk = isStreakAtRisk(completedDates, todayKey) && !checked;
  const goal = goalProgress(habit, checkins, weekMonday);

  const submitEdit = (e: FormEvent): void => {
    e.preventDefault();
    const res = onUpdate({ name, fullVersion: full, trigger, weeklyGoal });
    if (!res.ok) {
      setError(res.reason ?? 'Could not save changes.');
      return;
    }
    setError(null);
    setEditing(false);
  };

  // Target and trigger share one muted line so the row stays one glance tall.
  const meta = [
    habit.fullVersion && habit.fullVersion !== habit.name ? habit.fullVersion : '',
    habit.trigger ? `⏰ ${habit.trigger}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="py-2.5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          aria-label={checked ? `Uncheck ${habit.name}` : `Check ${habit.name}`}
          className={`check-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 max-md:h-8 max-md:w-8 ${
            checked
              ? 'border-sage-600 bg-sage-500 text-white dark:border-emerald-400 dark:bg-emerald-500'
              : 'border-cream-300 dark:border-slate-600'
          }`}
        >
          {checked ? '✓' : ''}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`truncate text-base font-semibold ${checked ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
              {habit.name}
            </p>
            <span
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs tabular-nums"
              title={streakMessage(streak)}
            >
              {showsStreak(streak) ? (
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  <span aria-hidden="true">🔥</span> {streak}
                </span>
              ) : null}
              {habit.weeklyGoal > 0 ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-semibold ${
                    goal.met
                      ? 'bg-sage-100 text-sage-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-cream-200 text-ink-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                  title={`Weekly goal: ${goal.done} of ${goal.goal} this week`}
                >
                  {goal.met ? '✓ ' : ''}
                  {goal.done}/{goal.goal} wk
                </span>
              ) : null}
              {checked ? (
                <span className="font-extrabold text-amber-600 dark:text-amber-300">+{xpForCheckin()}</span>
              ) : null}
            </span>
          </div>
          {meta ? (
            <p className="mt-0.5 truncate text-[13px] text-ink-500 dark:text-slate-400">{meta}</p>
          ) : null}
          {atRisk ? (
            <p className="mt-0.5 text-[13px] text-amber-700 dark:text-amber-300">
              Yesterday missed — streak reset. Do it today to relight it. 💛
            </p>
          ) : null}
          {/* The encouragement line stays for screen readers only; the row itself stays compact. */}
          <p className="sr-only" aria-live="polite">
            {streakMessage(streak)}
          </p>
          {editing ? (
            <form onSubmit={submitEdit} aria-label={`Edit ${habit.name}`} className="mt-3 space-y-2 rounded-xl bg-cream-100 p-3 dark:bg-slate-900/60">
              <div>
                <label htmlFor={`en-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Name
                </label>
                <input id={`en-${habit.id}`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls} />
              </div>
              <div>
                <label htmlFor={`ef-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Target — what counts as done
                </label>
                <input id={`ef-${habit.id}`} value={full} onChange={(e) => setFull(e.target.value)} maxLength={80} className={inputCls} />
              </div>
              <div>
                <label htmlFor={`et-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Trigger
                </label>
                <input id={`et-${habit.id}`} value={trigger} onChange={(e) => setTrigger(e.target.value)} maxLength={80} className={inputCls} />
              </div>
              <div>
                <label htmlFor={`eg-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Weekly goal — times per week
                </label>
                <input
                  id={`eg-${habit.id}`}
                  type="number"
                  min={0}
                  max={7}
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              {error ? (
                <p role="alert" className="text-[13px] text-amber-700 dark:text-amber-300">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button type="submit" className="min-h-[44px] flex-1 rounded-xl bg-sage-600 px-3 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                  className="min-h-[44px] rounded-xl border border-cream-300 px-4 text-sm dark:border-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`Options for ${habit.name}`}
            aria-expanded={menuOpen}
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-300 hover:bg-cream-200 hover:text-ink-600 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-xl border border-cream-200 bg-cream-50 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setName(habit.name);
                  setFull(habit.fullVersion);
                  setTrigger(habit.trigger);
                  setWeeklyGoal(habit.weeklyGoal);
                  setError(null);
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm hover:bg-cream-100 dark:hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete habit "${habit.name}"?`)) onRemove();
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
