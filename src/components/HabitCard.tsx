import { useState, type FormEvent, type ReactNode } from 'react';
import { xpForCheckin } from '../game/xp';
import type { CheckinVariant, Habit, HabitInput } from '../types';
import { calculateStreak, isStreakAtRisk, streakMessage } from '../utils/streak';

interface Props {
  habit: Habit;
  completedDates: string[];
  todayKey: string;
  checked: boolean;
  variant: CheckinVariant | null;
  onToggle: (variant: CheckinVariant) => void;
  onUpdate: (input: HabitInput) => { ok: boolean; reason?: string };
  onRemove: () => void;
}

const inputCls =
  'min-h-[44px] w-full rounded-xl border border-cream-200 bg-cream-50 px-3 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function HabitCard({ habit, completedDates, todayKey, checked, variant, onToggle, onUpdate, onRemove }: Props): ReactNode {
  const [picking, setPicking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [full, setFull] = useState(habit.fullVersion);
  const [small, setSmall] = useState(habit.smallVersion);
  const [trigger, setTrigger] = useState(habit.trigger);
  const [error, setError] = useState<string | null>(null);
  const streak = calculateStreak(completedDates, todayKey);
  const atRisk = isStreakAtRisk(completedDates, todayKey) && !checked;

  const submitEdit = (e: FormEvent): void => {
    e.preventDefault();
    const res = onUpdate({ name, fullVersion: full, smallVersion: small, trigger });
    if (!res.ok) {
      setError(res.reason ?? 'Could not save changes.');
      return;
    }
    setError(null);
    setEditing(false);
  };

  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => (checked ? onToggle(variant ?? 'full') : setPicking((p) => !p))}
          aria-pressed={checked}
          aria-label={checked ? `Uncheck ${habit.name}` : `Check ${habit.name}`}
          className={`check-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 max-md:h-8 max-md:w-8 ${
            checked
              ? 'border-sage-600 bg-sage-500 text-white dark:border-emerald-400 dark:bg-emerald-500'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          {checked ? '✓' : ''}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`text-[15px] font-semibold ${checked ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
              {habit.name}
            </p>
            <span className="flex shrink-0 items-center gap-1 text-sm tabular-nums" title={streakMessage(streak)}>
              <span aria-hidden="true">🔥</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{streak}</span>
              {checked && variant ? (
                <span className="font-extrabold text-amber-600 dark:text-amber-300">+{xpForCheckin(variant)}</span>
              ) : null}
            </span>
          </div>
          {habit.trigger ? (
            <p className="truncate text-[13px] text-slate-400 dark:text-slate-500">⏰ {habit.trigger}</p>
          ) : null}
          <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400" aria-live="polite">
            {streakMessage(streak)}
            {checked && variant ? (
              <span className="ml-2 rounded-full bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-700 dark:bg-emerald-900 dark:text-emerald-200">
                {variant === 'full' ? habit.fullVersion : habit.smallVersion}
              </span>
            ) : null}
          </p>
          {atRisk ? (
            <p className="mt-0.5 text-[13px] text-amber-700 dark:text-amber-300">
              Yesterday missed — the small version today keeps the streak safe. 💛
            </p>
          ) : null}
          {picking && !checked ? (
            <div className="mt-2 grid grid-cols-2 gap-2 max-md:grid-cols-1" role="group" aria-label="Pick a finished version">
              {(['full', 'small'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    onToggle(v);
                    setPicking(false);
                  }}
                  className="rounded-xl bg-sage-100 px-3 py-2 text-left hover:bg-sage-500/20 max-md:min-h-[44px] dark:bg-emerald-950 dark:hover:bg-emerald-900"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-sage-700 dark:text-emerald-300">
                    {v === 'full' ? 'Full' : 'Small 🌱'}
                  </span>
                  <span className="block text-sm text-slate-700 dark:text-slate-200">
                    {v === 'full' ? habit.fullVersion : habit.smallVersion}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          {editing ? (
            <form onSubmit={submitEdit} aria-label={`Edit ${habit.name}`} className="mt-3 space-y-2 rounded-xl bg-cream-100 p-3 dark:bg-slate-900/60">
              <div>
                <label htmlFor={`en-${habit.id}`} className="text-xs font-semibold text-slate-500">
                  Name
                </label>
                <input id={`en-${habit.id}`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                <div>
                  <label htmlFor={`ef-${habit.id}`} className="text-xs font-semibold text-slate-500">
                    Full version
                  </label>
                  <input id={`ef-${habit.id}`} value={full} onChange={(e) => setFull(e.target.value)} maxLength={80} className={inputCls} />
                </div>
                <div>
                  <label htmlFor={`es-${habit.id}`} className="text-xs font-semibold text-slate-500">
                    Small version 🌱
                  </label>
                  <input id={`es-${habit.id}`} value={small} onChange={(e) => setSmall(e.target.value)} maxLength={80} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor={`et-${habit.id}`} className="text-xs font-semibold text-slate-500">
                  Trigger
                </label>
                <input id={`et-${habit.id}`} value={trigger} onChange={(e) => setTrigger(e.target.value)} maxLength={80} className={inputCls} />
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
                  className="min-h-[44px] rounded-xl border border-slate-300 px-4 text-sm dark:border-slate-600"
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
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-300 hover:bg-cream-200 hover:text-slate-600 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
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
                  setSmall(habit.smallVersion);
                  setTrigger(habit.trigger);
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
