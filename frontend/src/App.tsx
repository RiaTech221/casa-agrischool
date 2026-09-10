import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExploitationsPage } from './pages/ExploitationsPage';
import { FormationsPage } from './pages/FormationsPage';
import { FormationDetailPage } from './pages/FormationDetailPage';
import { QuizPage } from './pages/QuizPage';
import { AlertesPage } from './pages/AlertesPage';
import { ForumPage } from './pages/ForumPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/formations" element={<FormationsPage />} />

              {/* Protected user routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profil" element={<ProfilePage />} />
                <Route path="/exploitations" element={<ExploitationsPage />} />
                <Route path="/formations/:id" element={<FormationDetailPage />} />
                <Route path="/quiz/:id" element={<QuizPage />} />
                <Route path="/alertes" element={<AlertesPage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/forum/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Protected admin route */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;