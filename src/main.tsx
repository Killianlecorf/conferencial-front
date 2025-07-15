import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthForm from './pages/AuthForm/AuthForm';
import App from './App';
import PrivateRoute from './utils/PrivateRoute';
import './index.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path="/authentification" element={<AuthForm />} />
      <Route path="/" element={
        <PrivateRoute>
          <App />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
);
