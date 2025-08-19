import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router/index';
import ErrorBoundary from './components/ErrorBoundary';
import DebugOverlay from './components/DebugOverlay';
import { errorLogger } from './utils/errorHandler';
import './index.css';

function App() {
  // Initialize error logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 React Error #31 Debug Mode Active - Error logger initialized');
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <DebugOverlay />
    </ErrorBoundary>
  );
}

export default App;