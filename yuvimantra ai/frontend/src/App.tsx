import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { MoodTracker } from './pages/MoodTracker';
import { Journal } from './pages/Journal';
import { StudyPlanner } from './pages/StudyPlanner';
import { HabitTracker } from './pages/HabitTracker';
import { Meditation } from './pages/Meditation';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';

// Query Client setup for React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Auth Guard for Private Pages
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Verifying user credentials...
      </div>
    );
  }
  
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Admin Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Verifying admin security...
      </div>
    );
  }

  return user && user.role === 'admin' ? <Layout>{children}</Layout> : <Navigate to="/dashboard" />;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Private Pages */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/moods"
        element={
          <PrivateRoute>
            <MoodTracker />
          </PrivateRoute>
        }
      />
      <Route
        path="/journal"
        element={
          <PrivateRoute>
            <Journal />
          </PrivateRoute>
        }
      />
      <Route
        path="/study"
        element={
          <PrivateRoute>
            <StudyPlanner />
          </PrivateRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <PrivateRoute>
            <HabitTracker />
          </PrivateRoute>
        }
      />
      <Route
        path="/meditation"
        element={
          <PrivateRoute>
            <Meditation />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
