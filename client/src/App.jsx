import React, { useState } from 'react';
import { weekInfo } from './utils/weeks';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import AiAssistantDrawer from './components/ai/AiAssistantDrawer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportEditorPage from './pages/ReportEditorPage';
import ReportHistoryPage from './pages/ReportHistoryPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ManagerReviewPage from './pages/ManagerReviewPage';
import MemberProfilePage from './pages/MemberProfilePage';
import ProjectManagementPage from './pages/ProjectManagementPage';
import UserManagementPage from './pages/UserManagementPage';

import { Sparkles, Bot } from 'lucide-react';

// Protected App Layout wrapper
const AppLayout = ({ children }) => {
  const { isManager } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      <Navbar
        onOpenAi={() => setIsAiOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Floating AI Chat Assistant Widget Button */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-150 group cursor-pointer border border-slate-800 text-xs font-medium"
        aria-label="Open AI Assistant"
        title="Chat with TeamPulse AI Assistant"
      >
        <Bot className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
        <span>AI Assistant</span>
        <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors" />
      </button>

      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentWeek={weekInfo().weekNumber}
        currentYear={weekInfo().year}
      />
    </div>
  );
};

// Route Guard: Requires authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Main App Router
export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          {/* Root Redirect based on role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedHome />
              </ProtectedRoute>
            }
          />

          {/* 9 Required Assignment Views */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/new"
            element={
              <ProtectedRoute>
                <ReportEditorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/:id/edit"
            element={
              <ProtectedRoute>
                <ReportEditorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <ManagerReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team/:userId"
            element={
              <ProtectedRoute>
                <MemberProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

const RoleBasedHome = () => {
  const { isManager } = useAuth();
  return <Navigate to={isManager ? '/dashboard' : '/reports'} replace />;
};

export default App;
