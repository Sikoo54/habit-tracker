/**
 * Habit Card Component
 * Interactive Main Quest row: one tap marks the habit done, with streak,
 * risk warning, weekly goal chip, and inline edit dialog. The menu offers
 * Edit, Delete, and Archive; archive keeps history, delete does not.
 */

import { useState, type FormEvent, type ReactNode } from 'react';
import { xpForCheckin } from '../game/xp';
import { goalProgress } from '../game/weeklyGoals';
import type { Checkin, Habit, HabitInput } from '../types';
import { isStreakAtRisk } from '../utils/streak';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  habit: Habit;
  checkins: Checkin[];
  weekMonday: string;
  todayKey: string;
  checked: boolean;
  onToggle: () => void;
  onUpdate: (input: HabitInput) => { ok: boolean; reason?: string };
  onDelete: () => void;
  onArchive: () => void;
  onOpenDetail: () => void;
  /** False on the first row, where the habit cannot move up. */
  canMoveUp: boolean;
  /** False on the last row, where the habit cannot move down. */
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  /** Receives the dragged habit id when another row is dropped here. */
  onDropHabit: (draggedId: string) => void;
}

const inputCls =
  'min-h-[44px] w-full rounded-xl border border-cream-200 bg-cream-50 px-3 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/** Individual habit list card item */
export function HabitCard({
  habit,
  checkins,
  weekMonday,
  todayKey,
  checked,
  onToggle,
  onUpdate,
  onDelete,
  onArchive,
  onOpenDetail,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDropHabit,
}: Props): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState<'delete' | 'archive' | null>(null);
  // Highlight while another row hovers over this one during a drag.
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [full, setFull] = useState(habit.fullVersion);
  const [trigger, setTrigger] = useState(habit.trigger);
  const [weeklyGoal, setWeeklyGoal] = useState(habit.weeklyGoal);
  const [error, setError] = useState<string | null>(null);
  // Only the plain fact: yesterday was missed. The reset story is not worth a line.
  const yesterdayMissed =
    isStreakAtRisk(
      checkins.filter((c) => c.habitId === habit.id).map((c) => c.date),
      todayKey,
    ) && !checked;
  const goal = goalProgress(habit, checkins, weekMonday);
  const checkinCount = checkins.filter((c) => c.habitId === habit.id).length;
  const checkinXp = checkinCount * xpForCheckin();

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

  // The weekly goal lives on the meta line to keep the name roomy on narrow screens.
  const goalChip =
    habit.weeklyGoal > 0 ? (
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
          goal.met
            ? 'bg-sage-100 text-sage-700 dark:bg-emerald-900/40 dark:text-emerald-200'
            : 'bg-cream-200 text-ink-600 dark:bg-slate-800 dark:text-slate-300'
        }`}
        title={`Weekly goal: ${goal.done} of ${goal.goal} this week`}
      >
        {goal.met ? '✓ ' : ''}
        {goal.done}/{goal.goal} wk
      </span>
    ) : null;

  return (
    <li
      // Desktop drag reorder; touch and keyboard use the menu actions below.
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', habit.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== habit.id) onDropHabit(draggedId);
      }}
      onDragEnd={() => setDragOver(false)}
      className={`py-2.5 ${
        dragOver
          ? 'rounded-xl bg-cream-100 ring-2 ring-sage-400 dark:bg-slate-800 dark:ring-emerald-500'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          title="Drag to reorder"
          className="mt-1.5 hidden cursor-grab select-none text-lg leading-none text-slate-300 active:cursor-grabbing md:block dark:text-slate-600"
        >
          ⠿
        </span>
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
            <button
              type="button"
              onClick={onOpenDetail}
              aria-label={`View 30-day history for ${habit.name}`}
              className={`group min-w-0 truncate text-left text-base font-semibold hover:underline hover:decoration-sage-500/50 hover:underline-offset-2 ${
                checked ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {habit.name}
              <span
                aria-hidden="true"
                className="ml-1 text-xs font-normal text-slate-400 group-hover:text-sage-600 dark:group-hover:text-emerald-300"
              >
                ›
              </span>
            </button>
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs tabular-nums">
              {checked ? (
                <span className="font-extrabold text-amber-600 dark:text-amber-300">
                  +{xpForCheckin()}
                </span>
              ) : null}
            </span>
          </div>
          {meta || goalChip ? (
            <div className="mt-0.5 flex items-center gap-2">
              {meta ? (
                <p className="min-w-0 flex-1 truncate text-[13px] text-ink-500 dark:text-slate-400">
                  {meta}
                </p>
              ) : (
                <span className="flex-1" />
              )}
              {goalChip}
            </div>
          ) : null}
          {yesterdayMissed ? (
            <p className="mt-0.5 text-[13px] font-medium text-amber-700 dark:text-amber-300">
              Yesterday missed.
            </p>
          ) : null}
          {editing ? (
            <form
              onSubmit={submitEdit}
              aria-label={`Edit ${habit.name}`}
              className="mt-3 space-y-2 rounded-xl bg-cream-100 p-3 dark:bg-slate-900/60"
            >
              <div>
                <label htmlFor={`en-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Name
                </label>
                <input
                  id={`en-${habit.id}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor={`ef-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Target — what counts as done
                </label>
                <input
                  id={`ef-${habit.id}`}
                  value={full}
                  onChange={(e) => setFull(e.target.value)}
                  maxLength={80}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor={`et-${habit.id}`} className="text-xs font-semibold text-ink-500">
                  Trigger
                </label>
                <input
                  id={`et-${habit.id}`}
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  maxLength={80}
                  className={inputCls}
                />
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
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 rounded-xl bg-sage-600 px-3 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
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
                disabled={!canMoveUp}
                onClick={() => {
                  onMoveUp();
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent"
              >
                ↑ Move up
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={() => {
                  onMoveDown();
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent"
              >
                ↓ Move down
              </button>
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
                  setConfirming('delete');
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming('archive');
                  setMenuOpen(false);
                }}
                className="block min-h-[44px] w-full px-3 text-left text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
              >
                Archive
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {confirming === 'delete' ? (
        <ConfirmDialog
          tone="danger"
          title={`Delete "${habit.name}" forever?`}
          description="Its check-ins and XP will be removed, and past streak days, stats, and achievements can change. Archive is safer if you want to keep history."
          detail={
            checkinCount > 0
              ? `${checkinCount} ${checkinCount === 1 ? 'check-in' : 'check-ins'} (${checkinXp} XP) will be deleted with this habit. This cannot be undone.`
              : 'This habit has no check-ins yet, so your stats will not change. This cannot be undone.'
          }
          confirmLabel="Delete forever"
          onConfirm={() => {
            setConfirming(null);
            onDelete();
          }}
          onCancel={() => setConfirming(null)}
        />
      ) : null}

      {confirming === 'archive' ? (
        <ConfirmDialog
          tone="archive"
          title={`Archive "${habit.name}"?`}
          description="It leaves today's board, but its check-ins, streak days, and heatmap stay exactly as they are."
          detail={
            checkinCount > 0
              ? `${checkinCount} ${checkinCount === 1 ? 'check-in' : 'check-ins'} will be kept. Restore it anytime from the Archived panel.`
              : 'Restore it anytime from the Archived panel.'
          }
          confirmLabel="Archive habit"
          onConfirm={() => {
            setConfirming(null);
            onArchive();
          }}
          onCancel={() => setConfirming(null)}
        />
      ) : null}
    </li>
  );
}
