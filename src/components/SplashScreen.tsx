import { useEffect, useState, type ReactNode } from 'react';

const HOLD_MS = 1200;
const FADE_MS = 500;

// Brief brand intro on every app open: logo + name, then fades away.
export function SplashScreen(): ReactNode {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setGone(true);
      return;
    }
    document.body.style.overflow = 'hidden';
    const fadeId = window.setTimeout(() => setFading(true), HOLD_MS);
    const goneId = window.setTimeout(() => {
      setGone(true);
      document.body.style.overflow = '';
    }, HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(goneId);
      document.body.style.overflow = '';
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-cream-100 transition-opacity dark:bg-slate-950 ${
        fading ? 'splash-out opacity-0' : 'splash-in opacity-100'
      }`}
    >
      <svg
        width="88"
        height="88"
        viewBox="0 0 64 64"
        className="splash-mark drop-shadow-lg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="15" fill="#22332b" />
        <g fill="none" stroke="#fffdf7" strokeWidth="3.5">
          <ellipse cx="32" cy="34" rx="21" ry="16" transform="rotate(-12 32 34)" />
          <ellipse cx="31.5" cy="32.5" rx="13.5" ry="10" transform="rotate(8 31.5 32.5)" />
        </g>
        <circle cx="31" cy="31" r="6" fill="none" stroke="#fffdf7" strokeWidth="3.5" />
        <circle cx="31" cy="31" r="2.5" fill="#d99a2b" />
      </svg>
      <p className="font-display text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
        AscendHabit
      </p>
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600 dark:text-emerald-400">
        On the ascent
      </span>
    </div>
  );
}
