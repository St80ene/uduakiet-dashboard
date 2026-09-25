import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './services/auth/context/AuthProvider.tsx';
import { DynamicFavicon } from './common/DynamicFavIcon.tsx';
import { ErrorBoundary } from './common/Error/ErrorBoundary.tsx';

// 1. Initialize the global client instance here
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <DynamicFavicon
            // badgeCount={4}
            // badgeVariant="danger"
            showBackground={true}
          />
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
