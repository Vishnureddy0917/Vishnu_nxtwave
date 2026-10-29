import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { ReferralRedirectPage } from './pages/ReferralRedirectPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage';
import { AdminChannelsPage } from './pages/AdminChannelsPage';
import { AdminReferralsPage } from './pages/AdminReferralsPage';
import { AdminBudgetPage } from './pages/AdminBudgetPage';
import { AdminInsightsPage } from './pages/AdminInsightsPage';
import { AdminStrategyPage } from './pages/AdminStrategyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

// Protected Route Wrapper for Admin Area
const RequireAdminAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-xs font-mono text-slate-400">
        Verifying administrator session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Public Layout Wrapper with Navbar & Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Workshop Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />
      <Route
        path="/registration/success"
        element={
          <PublicLayout>
            <RegistrationSuccessPage />
          </PublicLayout>
        }
      />
      <Route path="/r/:referralCode" element={<ReferralRedirectPage />} />
      <Route
        path="/leaderboard"
        element={
          <PublicLayout>
            <LeaderboardPage />
          </PublicLayout>
        }
      />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Command Center Routes */}
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="registrations" element={<AdminRegistrationsPage />} />
        <Route path="channels" element={<AdminChannelsPage />} />
        <Route path="referrals" element={<AdminReferralsPage />} />
        <Route path="budget" element={<AdminBudgetPage />} />
        <Route path="insights" element={<AdminInsightsPage />} />
        <Route path="strategy" element={<AdminStrategyPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
};

export default App;
