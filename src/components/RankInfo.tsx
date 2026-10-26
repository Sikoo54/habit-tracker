/**
 * Rank Info
 * Tiny ⓘ icon that reveals the full rank list while hovered (or focused via
 * keyboard), with the climber's current rank marked.
 */

import { useState, type ReactNode } from 'react';
import { RANKS } from '../game/xp';

interface Props {
  level: number;
}

export function RankInfo({ level }: Props): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <span
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-controls="rank-list"
        aria-label="All ranks"
        title="All ranks"
        className="flex h-6 w-6 cursor-help items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-cream-200 hover:text-ink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
      </span>

      {open ? (
        <div
          id="rank-list"
          role="region"
          aria-label="All ranks"
          className="absolute left-0 top-full z-20 mt-1.5 w-60 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-cream-200 bg-cream-50 p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="px-2 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Ranks · climb the ladder
          </p>
          <ol>
            {RANKS.map((r) => {
              const reached = level >= r.level;
              const isCurrent = level === r.level;
              return (
                <li
                  key={r.level}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] ${
                    isCurrent ? 'bg-sage-100 font-semibold text-sage-700 dark:bg-emerald-950/60 dark:text-emerald-200' : ''
                  }`}
                >
                  <span className="w-4 shrink-0 text-[11px] tabular-nums text-slate-400">{r.level}</span>
                  <span className={`min-w-0 flex-1 truncate ${reached ? '' : 'text-slate-400 dark:text-slate-500'}`}>{r.title}</span>
                  {isCurrent ? (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider">you</span>
                  ) : reached ? (
                    <span aria-label="reached" className="shrink-0 text-sage-600 dark:text-emerald-400">
                      ✓
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
