import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router/index';
import './index.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </>
  );
}

export default App;