import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to catch React error #31 and other runtime errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global Error:', JSON.stringify({
    message: typeof message === 'string' ? message : String(message),
    source: typeof source === 'string' ? source : String(source),
    lineno,
    colno,
    error: error instanceof Error ? error.message : String(error)
  }));
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', JSON.stringify({
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    promise: String(event.promise)
  }));
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <App />
);