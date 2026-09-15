import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AProposPage } from './pages/AProposPage';
import { ContactPage } from './pages/ContactPage';
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
import { ExpertDashboardPage } from './pages/ExpertDashboardPage';
import { ExpertQuizPage } from './pages/ExpertQuizPage';

// Layouts
import { MaraicherLayout } from './layouts/MaraicherLayout';
import { ExpertLayout } from './layouts/ExpertLayout';
import { AdminLayout } from './layouts/AdminLayout';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public landing, presentation & auth routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Maraîcher / Apprenant space with modern sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MaraicherLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/exploitations" element={<ExploitationsPage />} />
              <Route path="/formations" element={<FormationsPage />} />
              <Route path="/formations/:id" element={<FormationDetailPage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/alertes" element={<AlertesPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Public browsing fallback for visitors not logged in */}
          {!isAuthenticated && (
            <>
              <Route path="/formations" element={<FormationsPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/questions/:id" element={<QuestionDetailPage />} />
            </>
          )}

          {/* Protected expert routes with modern sidebar layout */}
          <Route element={<ProtectedRoute requiredRole={['ROLE_EXPERT', 'ROLE_ADMIN']} />}>
            <Route element={<ExpertLayout />}>
              <Route path="/expert" element={<ExpertDashboardPage defaultTab="dashboard" />} />
              <Route path="/expert/formations" element={<ExpertDashboardPage defaultTab="formations" />} />
              <Route path="/expert/formations/quiz" element={<ExpertQuizPage />} />
              <Route path="/expert/quiz" element={<ExpertQuizPage />} />
              <Route path="/expert/apprenants" element={<ExpertDashboardPage defaultTab="apprenants" />} />
              <Route path="/expert/alertes" element={<ExpertDashboardPage defaultTab="alertes" />} />
              <Route path="/expert/forum" element={<ExpertDashboardPage defaultTab="forum" />} />
              <Route path="/expert/forum/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/expert/profile" element={<ProfilePage />} />
              <Route path="/expert/profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected admin routes with modern sidebar layout */}
          <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage defaultTab="dashboard" />} />
              <Route path="/admin/utilisateurs" element={<AdminPage defaultTab="users" />} />
              <Route path="/admin/formations" element={<AdminPage defaultTab="formations" />} />
              <Route path="/admin/forum" element={<AdminPage defaultTab="moderation" />} />
              <Route path="/admin/alertes" element={<AdminPage defaultTab="alertes" />} />
              <Route path="/admin/exploitations" element={<AdminPage defaultTab="exploitations" />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
              <Route path="/admin/profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;