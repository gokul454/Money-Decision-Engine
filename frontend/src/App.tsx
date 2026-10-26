import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { MoneyProvider } from './context/MoneyContext.js';
import { MobileShell } from './components/MobileShell.js';
import { AddExpenseModal } from './components/AddExpenseModal.js';
import { NotificationDrawer } from './components/NotificationDrawer.js';
import { AIChatModal } from './components/AIChatModal.js';

import { HomePage } from './pages/HomePage.js';
import { AffordabilityPage } from './pages/AffordabilityPage.js';
import { TransactionsPage } from './pages/TransactionsPage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { FutureYouPage } from './pages/FutureYouPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <MobileShell>
            <HomePage />
          </MobileShell>
        }
      />

      <Route
        path="/affordability"
        element={
          <MobileShell>
            <AffordabilityPage />
          </MobileShell>
        }
      />

      <Route
        path="/transactions"
        element={
          <MobileShell>
            <TransactionsPage />
          </MobileShell>
        }
      />

      <Route
        path="/insights"
        element={
          <MobileShell>
            <InsightsPage />
          </MobileShell>
        }
      />

      <Route
        path="/goals"
        element={
          <MobileShell>
            <GoalsPage />
          </MobileShell>
        }
      />

      <Route
        path="/future-you"
        element={
          <MobileShell>
            <FutureYouPage />
          </MobileShell>
        }
      />

      <Route
        path="/profile"
        element={
          <MobileShell>
            <ProfilePage />
          </MobileShell>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MoneyProvider>
          <AppRoutes />
          <AddExpenseModal />
          <NotificationDrawer />
          <AIChatModal />
        </MoneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
