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

// App shell: slim top bar with hamburger (settings) left,
// centered segmented nav for fast switching, theme toggle right.
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

  return (
    <div className="min-h-screen bg-cream-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-100/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="grid min-h-[60px] w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 max-md:gap-1 max-md:px-2">
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
            <p className="text-lg font-extrabold max-lg:hidden">🌱 Good Habits</p>
          </div>

          <nav aria-label="Main navigation" className="flex min-w-0 justify-center">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-cream-200/60 p-1 dark:bg-slate-800">
              {ITEMS.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => onNavigate(it.key)}
                  aria-current={page === it.key ? 'page' : undefined}
                  className={`flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-colors max-md:px-2.5 ${
                    page === it.key
                      ? 'bg-cream-50 text-sage-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <span aria-hidden="true">{it.icon}</span>
                  <span className="max-md:text-[13px]">{it.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? 'Turn off dark mode' : 'Turn on dark mode'}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

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
              <p className="px-2 text-xl font-extrabold">⚙️ Settings</p>
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
            <button
              type="button"
              onClick={onToggleDark}
              className="mt-4 min-h-[44px] w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600"
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
