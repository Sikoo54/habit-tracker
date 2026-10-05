import { useState, type ReactNode } from 'react';
import { Layout } from './components/Layout';
import { useDarkMode } from './hooks/useDarkMode';
import { FocusPage } from './pages/FocusPage';
import { ReflectionPage } from './pages/ReflectionPage';
import { StatsPage } from './pages/StatsPage';
import { TodayPage } from './pages/TodayPage';
import { StorageContext } from './storage/StorageContext';
import { localStorageAdapter } from './storage/localStorageAdapter';
import type { PageKey } from './types';

export function App(): ReactNode {
  const [page, setPage] = useState<PageKey>('today');
  const { dark, toggle } = useDarkMode();

  return (
    <StorageContext.Provider value={localStorageAdapter}>
      <Layout page={page} onNavigate={setPage} dark={dark} onToggleDark={toggle}>
        {page === 'today' ? (
          <TodayPage key="today" />
        ) : page === 'focus' ? (
          <FocusPage />
        ) : page === 'stats' ? (
          <StatsPage />
        ) : (
          <ReflectionPage />
        )}
      </Layout>
    </StorageContext.Provider>
  );
}
