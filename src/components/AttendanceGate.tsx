/**
 * Attendance Gate Component
 * Full-screen blocking modal displayed in morning (from 04:00) and night (from 20:00)
 * prompting climbers to log their wake-up and bed-time attendance.
 */

import type { ReactNode } from 'react';
import type { AttendanceSlot } from '../game/attendance';
import { formatTanggalID } from '../utils/dates';

interface Props {
  slot: AttendanceSlot;
  date: string;
  streak: number;
  onConfirm: () => void;
}

/**
 * Full-screen absen gate: opens before the app at wake (from 04:00)
 * and before bed (from 20:00). One tap logs it and unlocks the day.
 */
export function AttendanceGate({ slot, date, streak, onConfirm }: Props): ReactNode {
  const morning = slot === 'morning';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pine-800 px-6 text-cream-50">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <ellipse cx="200" cy="210" rx="185" ry="140" transform="rotate(-12 200 210)" />
        <ellipse cx="196" cy="198" rx="120" ry="88" transform="rotate(8 196 198)" />
        <ellipse cx="192" cy="190" rx="62" ry="45" transform="rotate(-4 192 190)" />
      </svg>

      <div className="relative w-full max-w-md text-center">
        <p className="section-title text-cream-200/70">{formatTanggalID(date)}</p>

        <p className="mt-8 text-6xl" aria-hidden="true">
          {morning ? '🌅' : '🌙'}
        </p>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight">
          {morning ? 'Morning, climber.' : 'Day logged.'}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-cream-200/75">
          {morning
            ? 'Sign the logbook before the climb. One tap starts the day.'
            : 'Close the logbook before sleep. One tap ends the day.'}
        </p>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream-100">
          <span aria-hidden="true">{streak > 0 ? '🔥' : '✦'}</span>
          {streak > 0 ? `${streak}-day streak riding on this` : 'Start your streak today'}
        </p>

        <button
          type="button"
          autoFocus
          onClick={onConfirm}
          className="mt-8 min-h-[56px] w-full rounded-2xl bg-summit-500 px-6 text-base font-bold text-pine-800 transition-colors hover:bg-summit-600"
        >
          {morning ? "I'm awake — begin" : "I'm off to bed"}
        </button>

        <p className="mt-4 text-xs font-medium text-cream-200/60">+5 XP · keeps today's streak alive</p>
      </div>
    </main>
  );
}
