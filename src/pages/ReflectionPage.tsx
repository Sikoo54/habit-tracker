import { useState, type FormEvent, type ReactNode } from 'react';
import { EmptyState } from '../components/EmptyState';
import { ScorePicker } from '../components/ScorePicker';
import { useReflections } from '../hooks/useReflections';
import { formatTanggalID, todayKey } from '../utils/dates';

const fieldCls =
  'mt-2 min-h-[44px] w-full resize-y rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 leading-relaxed focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900';

export function ReflectionPage(): ReactNode {
  const today = todayKey();
  const { reflections, saveReflection } = useReflections();
  const existing = reflections.find((r) => r.date === today);

  const [wentWell, setWentWell] = useState(existing?.wentWell ?? '');
  const [toImprove, setToImprove] = useState(existing?.toImprove ?? '');
  const [mood, setMood] = useState<number | null>(existing?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const [saved, setSaved] = useState(false);
  const [openDate, setOpenDate] = useState<string | null>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    saveReflection(today, wentWell.trim(), toImprove.trim(), mood, energy);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const sorted = [...reflections].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="section-title text-sage-600 dark:text-emerald-300">{formatTanggalID(today)}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">🌙 Evening Reflection</h1>
      <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
        Two minutes, no grades. Honest beats perfect.
      </p>

      <form onSubmit={submit} aria-label="Today's reflection" className="mt-8">
        <label htmlFor="rw" className="text-lg font-bold">
          What went well today?
        </label>
        <textarea
          id="rw"
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Managed a morning walk, even just 5 minutes…"
          className={fieldCls}
        />
        <label htmlFor="ri" className="mt-6 block text-lg font-bold">
          What do you want to change tomorrow?
        </label>
        <textarea
          id="ri"
          value={toImprove}
          onChange={(e) => setToImprove(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Leave the phone outside the bedroom at 10pm…"
          className={fieldCls}
        />
        <div className="mt-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <ScorePicker label="Mood (1–5, optional)" value={mood} onChange={setMood} />
          <ScorePicker label="Energy (1–5, optional)" value={energy} onChange={setEnergy} />
        </div>
        <button type="submit" className="mt-6 min-h-[48px] w-full rounded-full bg-slate-800 px-4 font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
          Save reflection
        </button>
        {saved ? (
          <p role="status" className="mt-2 text-center text-sm text-sage-700 dark:text-emerald-300">
            Saved. Thanks for being honest today. 🌙
          </p>
        ) : null}
      </form>

      <h2 className="section-title mt-12 border-t border-cream-200 pt-8 text-slate-400 dark:border-slate-800 dark:text-slate-500">History</h2>
      {sorted.length === 0 ? (
        <EmptyState message="No reflections saved yet." hint="Write the first one tonight — one sentence is enough. 🌙" />
      ) : (
        <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
          {sorted.map((r) => {
            const open = openDate === r.date;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenDate(open ? null : r.date)}
                  aria-expanded={open}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 py-2.5 text-left font-medium"
                >
                  <span>{formatTanggalID(r.date)}</span>
                  <span aria-hidden="true" className="text-slate-300">{open ? '▾' : '▸'}</span>
                </button>
                {open ? (
                  <div className="pb-4 text-[15px] leading-relaxed">
                    <p>
                      <strong>Went well:</strong> {r.wentWell || '—'}
                    </p>
                    <p className="mt-1">
                      <strong>Change tomorrow:</strong> {r.toImprove || '—'}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Mood: {r.mood ?? '—'} · Energy: {r.energy ?? '—'}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
