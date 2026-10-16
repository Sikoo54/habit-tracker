import { useEffect, useRef, useState, type ReactNode } from 'react';

const D = 'M8 104 C 90 104, 108 86, 150 78 S 252 44, 312 18';

/** The memorable element: today's effort as a climb. Marker glides as you finish. */
export function AscentTrail({ done, total }: { done: number; total: number }): ReactNode {
  const pathRef = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: 8, y: 104 });
  const pct = total === 0 ? 0 : Math.min(1, done / total);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    let raf = 0;
    try {
      const len = el.getTotalLength();
      const place = (t: number): void => {
        const p = el.getPointAtLength(len * t);
        setPt({ x: p.x, y: p.y });
      };
      place(0);
      // One orchestrated moment: glide from basecamp on first paint.
      raf = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => place(pct));
      });
    } catch {
      // non-visual env: stay at basecamp
    }
    return () => window.cancelAnimationFrame(raf);
  }, [pct]);

  const reached = total > 0 && done >= total;

  return (
    <svg
      viewBox="0 0 320 120"
      className="mt-4 w-full max-w-md"
      role="progressbar"
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Ascent: ${done} of ${total} reached`}
    >
      {/* faint contour lines: quiet topography */}
      <path d="M-10 112 C 80 112, 140 100, 200 92 S 300 70, 330 60" fill="none" strokeWidth="1" className="stroke-cream-200 dark:stroke-slate-800" />
      <path d="M-10 92 C 90 92, 150 78, 210 68 S 300 48, 330 40" fill="none" strokeWidth="1" className="stroke-cream-200 dark:stroke-slate-800" />
      {/* the route */}
      <path d={D} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-cream-200 dark:stroke-slate-700" />
      <path
        ref={pathRef}
        d={D}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${pct} 1`}
        className="stroke-sage-500 dark:stroke-emerald-400"
      />
      {/* summit flag */}
      <line x1="312" y1="18" x2="312" y2="2" strokeWidth="2" className="stroke-slate-400 dark:stroke-slate-500" />
      <path
        d="M312 2 h14 l-3.5 4 3.5 4 h-14 Z"
        className={reached ? 'fill-summit-500' : 'fill-slate-300 dark:fill-slate-600'}
      />
      {/* climber */}
      <circle
        cx={pt.x}
        cy={pt.y}
        r="7"
        className="trail-marker fill-pine-800 dark:fill-amber-300"
      />
      <circle cx={pt.x} cy={pt.y} r="2.6" className="fill-cream-50 dark:fill-slate-900" />
    </svg>
  );
}
