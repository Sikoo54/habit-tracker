import { createContext, useContext } from 'react';
import type { StorageAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';

// Adapter diinjeksi lewat Context. Komponen/hook dilarang import localStorage langsung.
export const StorageContext = createContext<StorageAdapter>(localStorageAdapter);

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
