import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router/index';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </ErrorBoundary>
  );
}

export default App;