/**
 * Storage React Context
 * Injects the storage adapter into the React tree to avoid direct coupling
 * between components and specific persistence technologies.
 */

import { createContext, useContext } from 'react';
import type { StorageAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';

// Adapter diinjeksi lewat Context. Komponen/hook dilarang import localStorage langsung.
export const StorageContext = createContext<StorageAdapter>(localStorageAdapter);

/** Hook to access the configured storage adapter */
export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
