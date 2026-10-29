/**
 * App Layout & Shell Component
 * Provides responsive site frame, navigation bar with tabs (Today, Focus, Stats, Reflect),
 * player HUD bar, settings drawer, theme toggle, and keyboard shortcuts.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageKey } from '../types';
import { DataTools } from './DataTools';

interface Props {
  page: PageKey;
  onNavigate: (p: PageKey) => void;
  dark: boolean;
  onToggleDark: () => void;
  hud: ReactNode;
  children: ReactNode;
}

function Icon({ d }: { d: string }): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function BrandMark(): ReactNode {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#22332b" />
      <g fill="none" stroke="#fffdf7" strokeWidth="3.5">
        <ellipse cx="32" cy="34" rx="21" ry="16" transform="rotate(-12 32 34)" />
        <ellipse cx="31.5" cy="32.5" rx="13.5" ry="10" transform="rotate(8 31.5 32.5)" />
      </g>
      <circle cx="31" cy="31" r="6" fill="none" stroke="#fffdf7" strokeWidth="3.5" />
      <circle cx="31" cy="31" r="2.5" fill="#d99a2b" />
    </svg>
  );
}

const ITEMS: { key: PageKey; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { key: 'focus', label: 'Focus', icon: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
  { key: 'stats', label: 'Stats', icon: 'M4 20V10M10 20V4M16 20v-8M22 20H2' },
  { key: 'reflection', label: 'Reflect', icon: 'M20 13A8 8 0 0 1 11 4a6.5 6.5 0 0 0 9 9Z' },
];

/** Main layout shell wrapping all page routes with top nav and settings drawer */
export function Layout({ page, onNavigate, dark, onToggleDark, hud, children }: Props): ReactNode {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open ]);

  return (
    <div className="min-h-screen bg-cream-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-100/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="grid min-h-[60px] w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 max-md:px-3 max-md:py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open settings"
              aria-haspopup="dialog"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
            >
              <span aria-hidden="true">☰</span>
            </button>
            <p className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
              <span className="text-sage-600 dark:text-emerald-400">
                <BrandMark />
              </span>
              <span className="max-sm:hidden">AscendHabit</span>
            </p>
          </div>

          <nav aria-label="Main navigation" className="flex min-w-0 justify-center max-md:hidden">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-cream-200 bg-cream-50 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {ITEMS.map((it) => {
                const active = page === it.key;
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => onNavigate(it.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-bold transition-all ${
                      active
                        ? 'bg-slate-800 text-amber-300 shadow-md dark:bg-amber-400 dark:text-slate-900'
                        : 'text-ink-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon d={it.icon} />
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center justify-end gap-1 md:justify-self-end">
            {hud}
            <button
              type="button"
              onClick={onToggleDark}
              aria-label={dark ? 'Turn off dark mode' : 'Turn on dark mode'}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
            >
              <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-200 bg-cream-100/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95"
      >
        <div className="flex items-stretch gap-0.5 px-2 py-1.5">
          {ITEMS.map((it) => {
            const active = page === it.key;
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => onNavigate(it.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition-colors ${
                  active
                    ? 'bg-cream-200/80 text-sage-700 dark:bg-slate-800 dark:text-emerald-300'
                    : 'text-ink-500 hover:bg-cream-200/50 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                <Icon d={it.icon} />
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings drawer + backdrop */}
      {open ? (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Settings">
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/40"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-cream-50 p-4 shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 px-2 text-xl font-extrabold">
                <span className="text-sage-600 dark:text-emerald-400">
                  <BrandMark />
                </span>
                AscendHabit
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close settings"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-700"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="mt-4">
              <DataTools onResetDone={() => window.location.reload()} />
            </div>
            <div className="flex-1" />
            <p className="px-2 pt-4 text-xs text-ink-500 dark:text-slate-400">
              Built by{' '}
              <a
                href="https://sachaahsan.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sage-700 underline decoration-sage-500/40 underline-offset-2 hover:text-sage-600 dark:text-emerald-400"
              >
                Sacha Ahsan
              </a>
            </p>
            <button
              type="button"
              onClick={onToggleDark}
              className="mt-4 min-h-[44px] w-full rounded-xl border border-cream-300 px-3 py-2 dark:border-slate-600"
            >
              {dark ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </aside>
        </div>
      ) : null}

      {/* Full-screen content */}
      <main className="w-full px-6 py-6 pb-24 max-md:px-3 md:pb-6">{children}</main>
    </div>
  );
}
