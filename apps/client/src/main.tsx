import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import i18n from './i18n/i18n.config';
import { QueryClientProvider } from './providers/QueryClientProvider/QueryClientProvider';

import '@workspace/ui/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
);
