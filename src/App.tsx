import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AttendanceGate } from './components/AttendanceGate';
import { HudStats, LevelUpModal } from './components/Hud';
import { Layout } from './components/Layout';
import { SplashScreen } from './components/SplashScreen';
import { gateFor } from './game/attendance';
import { activeDates, lastActiveDate } from './game/dailyStreak';
import { totalXp } from './game/xp';
import { useAttendance } from './hooks/useAttendance';
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

export function App(): ReactNode {
  const [page, setPage] = useState<PageKey>('today');
  const { dark, toggle } = useDarkMode();

  return (
    <StorageContext.Provider value={localStorageAdapter}>
      <SplashScreen />
      <Shell page={page} onNavigate={setPage} dark={dark} onToggleDark={toggle} />
    </StorageContext.Provider>
  );
}

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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const today = todayKey(now);
  const habitsApi = useHabits();
  const tasksApi = useTasks(today);
  const checkinsApi = useCheckins();
  const reflectionsApi = useReflections();
  const attendanceApi = useAttendance();

  const ready =
    !habitsApi.loading &&
    !tasksApi.loading &&
    !checkinsApi.loading &&
    !reflectionsApi.loading &&
    !attendanceApi.loading;

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
      hud={<HudStats progress={game.progress} creature={game.creature} streak={game.streak} rank={game.rank} />}
    >
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
      {levelUp.show ? (
        <LevelUpModal level={game.progress.level} rank={game.rank} creature={game.creature} onClose={levelUp.dismiss} />
      ) : null}
    </Layout>
  );
}
