/**
 * App Root Component
 * Sets up storage context provider, theme state, page routing,
 * game systems (XP, streaks, frost decay), and attendance gating.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AttendanceGate } from './components/AttendanceGate';
import { AchievementToast } from './components/AchievementToast';
import { HudStats, LevelUpModal } from './components/Hud';
import { Layout } from './components/Layout';
import { gateFor } from './game/attendance';
import { activeDates, lastActiveDate } from './game/dailyStreak';
import { totalXp } from './game/xp';
import { useAttendance } from './hooks/useAttendance';
import { useAchievementToasts } from './hooks/useAchievementToasts';
import { useCheckins } from './hooks/useCheckins';
import { useDarkMode } from './hooks/useDarkMode';
import { useDecayLedger, useGameStats, useLevelUp } from './hooks/useGame';
import { useHabits } from './hooks/useHabits';
import { useReflections } from './hooks/useReflections';
import { useTasks } from './hooks/useTasks';
import { FocusPage } from './pages/FocusPage';
import { ReflectionPage } from './pages/ReflectionPage';
import { StatsPage } from './pages/StatsPage';
import { TodayPage } from './pages/TodayPage';
import { StorageContext } from './storage/StorageContext';
import { localStorageAdapter } from './storage/localStorageAdapter';
import type { PageKey } from './types';
import { todayKey } from './utils/dates';

/** Root application wrapper injecting storage and active theme */
export function App(): ReactNode {
  const [page, setPage] = useState<PageKey>('today');
  const { dark, toggle } = useDarkMode();

  return (
    <StorageContext.Provider value={localStorageAdapter}>
      <Shell page={page} onNavigate={setPage} dark={dark} onToggleDark={toggle} />
    </StorageContext.Provider>
  );
}

/** Internal app shell managing time ticking, domain hooks, game state, and navigation */
function Shell({
  page,
  onNavigate,
  dark,
  onToggleDark,
}: {
  page: PageKey;
  onNavigate: (p: PageKey) => void;
  dark: boolean;
  onToggleDark: () => void;
}): ReactNode {
  // Minute-by-minute clock tick for accurate day/gate transitions
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const today = todayKey(now);
  // Domain data hooks
  const habitsApi = useHabits();
  const tasksApi = useTasks(today);
  const checkinsApi = useCheckins();
  const reflectionsApi = useReflections();
  const attendanceApi = useAttendance();

  // Storage readiness check across all domain collections
  const ready =
    !habitsApi.loading &&
    !tasksApi.loading &&
    !checkinsApi.loading &&
    !reflectionsApi.loading &&
    !attendanceApi.loading;

  // Active dates calculation for global streak and decay tracking
  const dates = useMemo(
    () =>
      activeDates(checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections, attendanceApi.attendance),
    [checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections, attendanceApi.attendance],
  );
  const lastActive = useMemo(() => lastActiveDate(dates), [dates]);
  const grossXp = useMemo(
    () => totalXp(checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections, attendanceApi.attendance),
    [checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections, attendanceApi.attendance],
  );

  // Gamification mechanics: penalty decay calculation and level progress
  const decay = useDecayLedger(grossXp, dates, lastActive, today, ready);
  const game = useGameStats(
    habitsApi.habits,
    checkinsApi.checkins,
    tasksApi.tasks,
    reflectionsApi.reflections,
    attendanceApi.attendance,
    today,
    decay.ledger.total,
  );
  const levelUp = useLevelUp(game.progress.level);
  const unlockToasts = useAchievementToasts(game.achievements, ready);

  // Attendance gate: full screen morning/night prompt if active
  const gate = ready ? gateFor(attendanceApi.attendance, today, now.getHours()) : null;
  if (gate) {
    return (
      <AttendanceGate
        slot={gate}
        date={today}
        streak={game.streak}
        onConfirm={() => attendanceApi.mark(today, gate)}
      />
    );
  }

  return (
    <Layout
      page={page}
      onNavigate={onNavigate}
      dark={dark}
      onToggleDark={onToggleDark}
      hud={<HudStats progress={game.progress} ascent={game.ascent} streak={game.streak} rank={game.rank} />}
    >
      {/* Route rendering based on active page state */}
      {page === 'today' ? (
        <TodayPage
          key="today"
          habitsApi={habitsApi}
          tasksApi={tasksApi}
          checkinsApi={checkinsApi}
          game={game}
          penaltyNotice={decay.notice}
          onDismissPenalty={decay.dismissNotice}
        />
      ) : page === 'focus' ? (
        <FocusPage tasksApi={tasksApi} habitsApi={habitsApi} checkinsApi={checkinsApi} />
      ) : page === 'stats' ? (
        <StatsPage habitsApi={habitsApi} checkinsApi={checkinsApi} game={game} />
      ) : (
        <ReflectionPage reflectionsApi={reflectionsApi} />
      )}
      {/* Celebration modal when leveling up */}
      {levelUp.show ? (
        <LevelUpModal level={game.progress.level} rank={game.rank} ascent={game.ascent} onClose={levelUp.dismiss} />
      ) : null}
      <AchievementToast toast={unlockToasts.toast} queued={unlockToasts.queued} onDismiss={unlockToasts.dismiss} />
    </Layout>
  );
}
