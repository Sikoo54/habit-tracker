/**
 * Data Tools Component
 * Provides backup export (JSON download), import preview with a safety
 * snapshot, restore, and data reset controls inside the settings drawer.
 */

import { useRef, useState, type ReactNode } from 'react';
import { previewImport, type ImportSummary } from '../storage/importPreview';
import { useStorage } from '../storage/StorageContext';
import type { ExportPayload } from '../types';
import {
  backupLabel,
  backupStatus,
  markBackedUp,
  readLastBackup,
  readPreImportBackup,
  savePreImportBackup,
  type PreImportBackup,
} from '../utils/backup';
import { formatTanggalID, toDateKey } from '../utils/dates';
import { ConfirmDialog } from './ConfirmDialog';

/** Human date for a backup timestamp, tolerant of missing/corrupt values. */
function backupDate(iso: string | null): string {
  if (!iso) return 'an unknown date';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'an unknown date';
  return formatTanggalID(toDateKey(date));
}

/** One cell in the import preview summary grid. */
function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}): ReactNode {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-100/60 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-lg font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-slate-400">
        {label}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** Import/Export and reset data settings component */
export function DataTools({ onResetDone }: { onResetDone: () => void }): ReactNode {
  const storage = useStorage();
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(readLastBackup);
  const [snapshot, setSnapshot] = useState<PreImportBackup | null>(readPreImportBackup);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [candidate, setCandidate] = useState<{
    fileName: string;
    payload: ExportPayload;
    summary: ImportSummary;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const backup = backupStatus(lastBackup);

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
      markBackedUp();
      setLastBackup(new Date().toISOString());
      setMsg('Data exported. 📦');
    } catch {
      setMsg('Could not export data.');
    }
  };

  /** Reads and validates a chosen file, then opens the preview instead of writing. */
  const stageImport = async (file: File): Promise<void> => {
    setMsg(null);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setMsg('That file is not valid JSON. Import cancelled.');
        return;
      }
      const preview = previewImport(parsed);
      if (!preview.ok) {
        setMsg(preview.reason);
        return;
      }
      setCandidate({ fileName: file.name, payload: preview.payload, summary: preview.summary });
    } catch {
      setMsg('Could not read that file. Import cancelled.');
    }
  };

  /** Backs up current data, then replaces it with the reviewed import. */
  const runImport = async (): Promise<void> => {
    if (!candidate || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const current = await storage.exportAll();
      if (!savePreImportBackup(current)) {
        setCandidate(null);
        setMsg(
          'Import cancelled: storage is full, so the safety backup could not be saved. Export JSON manually, then try again.',
        );
        return;
      }
      setSnapshot(readPreImportBackup());
      await storage.importAll(candidate.payload);
      setCandidate(null);
      setMsg('Import done. Previous data was saved as a local backup. ✅');
      setNeedsReload(true);
    } catch {
      setCandidate(null);
      setMsg('Import failed. Current data was not changed.');
    } finally {
      setBusy(false);
    }
  };

  /** Restores the safety snapshot saved before the latest import. */
  const runRestore = async (): Promise<void> => {
    if (!snapshot || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await storage.importAll(snapshot.payload);
      setConfirmRestore(false);
      setSnapshot(readPreImportBackup());
      setMsg('Pre-import data restored. Reload the page to see it. 🔄');
      setNeedsReload(true);
    } catch {
      setConfirmRestore(false);
      setMsg('Could not restore the backup. Current data was not changed.');
    } finally {
      setBusy(false);
    }
  };

  const doReset = async (): Promise<void> => {
    try {
      await storage.clearAll();
      setConfirmReset(false);
      setSnapshot(null);
      setMsg('All data deleted. Reload the page. 🧹');
      setNeedsReload(true);
      onResetDone();
    } catch {
      setMsg('Could not reset data.');
    }
  };

  const btn =
    'min-h-[44px] w-full rounded-xl px-4 text-left text-sm font-medium hover:bg-cream-200/70 disabled:opacity-50 dark:hover:bg-slate-700';

  return (
    <div aria-label="Manage data">
      <p className="section-title px-1 text-slate-400 dark:text-slate-500">Manage data</p>
      <p
        role="status"
        className={`mt-1 flex items-start gap-1.5 px-1 text-[12px] ${
          backup.due ? 'text-amber-800 dark:text-amber-200' : 'text-ink-500 dark:text-slate-400'
        }`}
      >
        <span aria-hidden="true">{backup.due ? '⚠️' : '✅'}</span>
        <span>
          {backupLabel(backup)}
          {backup.due ? (
            <span className="font-semibold">
              {' '}
              — export now, a cleared browser wipes local data.
            </span>
          ) : null}
        </span>
      </p>
      <div className="mt-1">
        <button type="button" onClick={doExport} disabled={busy} className={btn}>
          📦 Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={btn}
        >
          📥 Import JSON
        </button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          disabled={busy}
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
            if (f) void stageImport(f);
            e.target.value = '';
          }}
        />
      </div>

      {snapshot ? (
        <div className="mt-2 rounded-xl border border-cream-200 bg-cream-100/50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setConfirmRestore(true)}
            disabled={busy}
            className={`${btn} text-sage-700 dark:text-emerald-300`}
          >
            ↩️ Restore pre-import backup
          </button>
          <p className="px-1 text-[11px] text-ink-500 dark:text-slate-400">
            Snapshot from {backupDate(snapshot.createdAt)}. Saved automatically before the last
            import.
          </p>
        </div>
      ) : null}

      {msg ? (
        <div className="mt-1 px-1">
          <p role="status" className="text-sm text-ink-500 dark:text-slate-400">
            {msg}
          </p>
          {needsReload ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1.5 min-h-[36px] rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Reload now
            </button>
          ) : null}
        </div>
      ) : null}

      <details className="mx-1 mt-2 rounded-xl border border-cream-200 bg-cream-100/60 dark:border-slate-700 dark:bg-slate-800/60">
        <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-cream-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60">
          <span aria-hidden="true">📱</span> How to move my data to another device
        </summary>

        <div className="px-3 pb-3 pt-1">
          <p className="text-[13px] text-ink-500 dark:text-slate-400">
            Data lives inside this browser, so each device keeps its own copy. Copying it over takes
            one export and one import.
          </p>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            On the device you are leaving
          </p>
          <ol className="mt-1 space-y-1.5">
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">1.</span>
              <span>
                Tap <strong>Export JSON</strong> above.
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">2.</span>
              <span>
                The file{' '}
                <code className="rounded bg-cream-200 px-1 text-[12px] dark:bg-slate-700">
                  habit-tracker-YYYY-MM-DD.json
                </code>{' '}
                lands in Downloads (or Files on iPhone).
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">3.</span>
              <span>Send it to yourself — Telegram, WhatsApp, Drive, or email.</span>
            </li>
          </ol>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            On the new device
          </p>
          <ol className="mt-1 space-y-1.5">
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">4.</span>
              <span>
                Open <span className="whitespace-nowrap">ascend-habit.vercel.app</span> and add it
                to your home screen (browser menu → <strong>Add to Home screen</strong>).
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">5.</span>
              <span>
                Open the app from that icon, then Settings → <strong>Import JSON</strong> → pick the
                file. Review the summary and confirm.
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">6.</span>
              <span>Reload the page once the import message appears.</span>
            </li>
          </ol>

          <div className="mt-3 rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950/40">
            <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-100">
              <strong>Import replaces everything</strong> on that device — it is not a merge. A
              safety snapshot of the current data is saved first, so a wrong file can be undone from
              Settings. Devices do <strong>not</strong> sync, so move data again from whichever
              device you used last.
            </p>
          </div>

          <p className="mt-2 text-[12px] text-ink-500 dark:text-slate-400">
            Tip: export once a month and keep the file in Drive. A cleared browser can wipe local
            data.
          </p>
        </div>
      </details>

      {candidate ? (
        <ConfirmDialog
          tone="danger"
          icon="📥"
          title="Replace all data?"
          description={`Import "${candidate.fileName}" from ${backupDate(candidate.summary.exportedAt)}? This replaces everything on this device — it is not a merge.`}
          confirmLabel={busy ? 'Importing…' : 'Replace data'}
          onConfirm={() => void runImport()}
          onCancel={() => setCandidate(null)}
          detail={
            candidate.summary.skipped > 0
              ? `${candidate.summary.skipped} invalid ${candidate.summary.skipped === 1 ? 'record' : 'records'} will be skipped. A backup of your current data is saved automatically first.`
              : 'A backup of your current data is saved automatically first. Restore it from Settings if this import is a mistake.'
          }
        >
          <div className="mt-4 grid grid-cols-2 gap-2">
            <SummaryStat
              label="Habits"
              value={candidate.summary.habits}
              hint={`${candidate.summary.activeHabits} active · ${candidate.summary.archivedHabits} archived`}
            />
            <SummaryStat label="Check-ins" value={candidate.summary.checkins} />
            <SummaryStat label="Side quests" value={candidate.summary.tasks} />
            <SummaryStat label="Reflections" value={candidate.summary.reflections} />
            <SummaryStat label="Attendance" value={candidate.summary.attendance} />
            <SummaryStat label="Invalid" value={candidate.summary.skipped} hint="will be skipped" />
          </div>
        </ConfirmDialog>
      ) : null}

      {confirmRestore && snapshot ? (
        <ConfirmDialog
          tone="danger"
          icon="↩️"
          title="Restore pre-import backup?"
          description={`Replace the current data with the snapshot from ${backupDate(snapshot.createdAt)}? This is not a merge.`}
          detail="Changes made since that import will be replaced. Your current data is not backed up again by this action."
          confirmLabel={busy ? 'Restoring…' : 'Restore backup'}
          onConfirm={() => void runRestore()}
          onCancel={() => setConfirmRestore(false)}
        />
      ) : null}

      {confirmReset ? (
        <ConfirmDialog
          tone="danger"
          title="Delete all data?"
          description="This removes every habit, quest, check-in, reflection, and attendance record on this device."
          detail="Export JSON first if you might want this data later. This cannot be undone."
          confirmLabel="Delete everything"
          onConfirm={() => void doReset()}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}
