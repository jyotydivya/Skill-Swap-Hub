import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage     from './pages/HomePage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage   from './pages/SearchPage';
import ProfilePage  from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import ChatPage     from './pages/ChatPage';
import AdminPage    from './pages/AdminPage';
import PaymentPage  from './pages/PaymentPage';

// Shared
import Navbar from './components/Shared/Navbar';

// ── Route Guards ──────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

// ── App Routes ────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
          <Route path="/chat"     element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/payment"  element={<PrivateRoute><PaymentPage /></PrivateRoute>} />

          <Route path="/admin"    element={<AdminRoute><AdminPage /></AdminRoute>} />

          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
