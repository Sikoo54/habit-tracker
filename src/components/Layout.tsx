import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageKey } from '../types';
import { DataTools } from './DataTools';

interface Props {
  page: PageKey;
  onNavigate: (p: PageKey) => void;
  dark: boolean;
  onToggleDark: () => void;
  children: ReactNode;
}

const ITEMS: { key: PageKey; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: '🏠' },
  { key: 'focus', label: 'Focus', icon: '🍅' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'reflection', label: 'Reflect', icon: '🌙' },
];

// Full-screen app: one slim top bar with a hamburger (top-left).
// Navigation lives in a slide-in drawer so content owns the whole screen.
export function Layout({ page, onNavigate, dark, onToggleDark, children }: Props): ReactNode {
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

  const go = (p: PageKey): void => {
    onNavigate(p);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Slim top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-100/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex min-h-[56px] w-full items-center gap-2 px-4 max-md:px-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <p className="text-lg font-extrabold">🌱 Good Habits</p>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? 'Turn off dark mode' : 'Turn on dark mode'}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      {/* Drawer + backdrop */}
      {open ? (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/40"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-cream-50 p-4 shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="px-2 text-xl font-extrabold">🌱 Good Habits</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <p className="px-2 text-sm text-slate-500 dark:text-slate-400">Small focus, every day.</p>
            <nav className="mt-4 space-y-1" aria-label="Main navigation">
              {ITEMS.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => go(it.key)}
                  aria-current={page === it.key ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-medium ${
                    page === it.key
                      ? 'bg-sage-100 text-sage-700 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span aria-hidden="true">{it.icon}</span> {it.label}
                </button>
              ))}
            </nav>
            <div className="flex-1" />
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <DataTools onResetDone={() => window.location.reload()} />
            </div>
            <button
              type="button"
              onClick={onToggleDark}
              className="mt-3 min-h-[44px] w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600"
            >
              {dark ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </aside>
        </div>
      ) : null}

      {/* Full-screen content */}
      <main className="w-full px-6 py-6 max-md:px-3">{children}</main>
    </div>
  );
}
