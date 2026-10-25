/**
 * Application Entry Point
 * Mounts the React component tree into the DOM root element and registers
 * the PWA service worker for offline support and auto-updates.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './index.css';

// Register the PWA service worker immediately for background caching
registerSW({ immediate: true });

// Locate mount container in index.html
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Elemen #root tidak ditemukan di index.html');

// Initialize React root and render application in strict mode
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
