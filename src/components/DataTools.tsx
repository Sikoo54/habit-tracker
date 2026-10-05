import { useRef, useState, type ReactNode } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { ExportPayload } from '../types';

export function DataTools({ onResetDone }: { onResetDone: () => void }): ReactNode {
  const storage = useStorage();
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async (): Promise<void> => {
    try {
      const data = await storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-tracker-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Data exported. 📦');
    } catch {
      setMsg('Could not export data.');
    }
  };

  const doImportFile = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportPayload;
      await storage.importAll(parsed);
      setMsg('Import done. Reload the page to see the data. ✅');
    } catch {
      setMsg('Invalid file. Import cancelled.');
    }
  };

  const doReset = async (): Promise<void> => {
    try {
      await storage.clearAll();
      setConfirmReset(false);
      setMsg('All data deleted. Reload the page. 🧹');
      onResetDone();
    } catch {
      setMsg('Could not reset data.');
    }
  };

  const btn =
    'min-h-[44px] w-full rounded-xl px-4 text-left text-sm font-medium hover:bg-cream-200/70 dark:hover:bg-slate-700';

  return (
    <div aria-label="Manage data">
      <p className="section-title px-1 text-slate-400 dark:text-slate-500">Manage data</p>
      <div className="mt-1">
        <button type="button" onClick={doExport} className={btn}>
          📦 Export JSON
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
          📥 Import JSON
        </button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className={`${btn} text-red-600 dark:text-red-300`}
        >
          🧹 Reset data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          aria-label="Pick a JSON file to import"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doImportFile(f);
            e.target.value = '';
          }}
        />
      </div>
      {msg ? (
        <p role="status" className="mt-1 px-1 text-sm text-slate-500 dark:text-slate-400">
          {msg}
        </p>
      ) : null}
      {confirmReset ? (
        <div role="alertdialog" aria-modal="true" aria-label="Confirm reset" className="mt-2 rounded-xl bg-red-50 p-3 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            Delete all data? This cannot be undone.
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={doReset} className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[44px] flex-1 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-600">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
