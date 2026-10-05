import { useState, type FormEvent, type ReactNode } from 'react';

interface Props {
  onAdd: (input: { name: string; fullVersion: string; smallVersion: string; trigger: string }) => { ok: boolean; reason?: string };
  disabled: boolean;
}

export function HabitForm({ onAdd, disabled }: Props): ReactNode {
  const [name, setName] = useState('');
  const [full, setFull] = useState('');
  const [small, setSmall] = useState('');
  const [trigger, setTrigger] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const res = onAdd({ name, fullVersion: full, smallVersion: small, trigger });
    if (!res.ok) {
      setError(res.reason ?? 'Could not add habit.');
      return;
    }
    setName('');
    setFull('');
    setSmall('');
    setTrigger('');
    setError(null);
  };

  const inputCls =
    'min-h-[44px] w-full rounded-xl border border-cream-200 bg-cream-50 px-3 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

  return (
    <details className="group rounded-2xl bg-sage-100/60 dark:bg-slate-800/60">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-sage-700 dark:text-emerald-300 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">＋</span> New habit
        <span className="ml-auto text-xs font-normal text-slate-400">max 5 active</span>
      </summary>
      <form onSubmit={submit} aria-label="Add new habit" className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div className="col-span-2">
            <label htmlFor="hn" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Habit name
            </label>
            <input id="hn" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reading" maxLength={60} className={inputCls} />
          </div>
          <div>
            <label htmlFor="hf" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Full version
            </label>
            <input id="hf" value={full} onChange={(e) => setFull(e.target.value)} placeholder="e.g. Read 20 pages" maxLength={80} className={inputCls} />
          </div>
          <div>
            <label htmlFor="hs" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Small version 🌱
            </label>
            <input id="hs" value={small} onChange={(e) => setSmall(e.target.value)} placeholder="e.g. Read 1 page" maxLength={80} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label htmlFor="ht" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Trigger (habit stacking)
            </label>
            <input id="ht" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="e.g. After morning toothbrush" maxLength={80} className={inputCls} />
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={disabled}
          className="mt-3 min-h-[44px] w-full rounded-xl bg-sage-600 px-4 font-semibold text-white hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {disabled ? 'Already 5 active habits' : 'Save habit'}
        </button>
      </form>
    </details>
  );
}
