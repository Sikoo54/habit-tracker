import { useMemo, useState, type ReactNode } from 'react';
import { HudStats, LevelUpModal } from './components/Hud';
import { Layout } from './components/Layout';
import { activeDates, lastActiveDate } from './game/dailyStreak';
import { totalXp } from './game/xp';
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
  const today = todayKey();
  const habitsApi = useHabits();
  const tasksApi = useTasks(today);
  const checkinsApi = useCheckins();
  const reflectionsApi = useReflections();

  const ready =
    !habitsApi.loading && !tasksApi.loading && !checkinsApi.loading && !reflectionsApi.loading;

  const dates = useMemo(
    () => activeDates(checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections),
    [checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections],
  );
  const lastActive = useMemo(() => lastActiveDate(dates), [dates]);
  const grossXp = useMemo(
    () => totalXp(checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections),
    [checkinsApi.checkins, tasksApi.tasks, reflectionsApi.reflections],
  );

  const decay = useDecayLedger(grossXp, dates, lastActive, today, ready);
  const game = useGameStats(
    habitsApi.habits,
    checkinsApi.checkins,
    tasksApi.tasks,
    reflectionsApi.reflections,
    today,
    decay.ledger.total,
  );
  const levelUp = useLevelUp(game.progress.level);

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
        <FocusPage tasksApi={tasksApi} />
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
