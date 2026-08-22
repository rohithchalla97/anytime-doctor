import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import { ThemeProvider } from './context/themecontext';

import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/registerpage';
import DashboardPage     from './pages/dashboardpage';
import ChatPage          from './pages/chatpage';
import DoctorsPage       from './pages/doctorspage';
import AppointmentsPage  from './pages/appointmentspage';
import ProfilePage       from './pages/profilepage';
import DoctorLoginPage   from './pages/doctorloginpage';
import DoctorDashboard   from './pages/DoctorDashboard';
import AdminPage          from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function DoctorRoute({ children }) {
  const token = localStorage.getItem('doctorToken');
  return token ? children : <Navigate to="/doctor/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin" replace />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route path="/"              element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/doctor/login"  element={<DoctorLoginPage />} />
      <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
      <Route path="/admin"         element={<AdminPage />} />
      <Route path="/admin/manage" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="/dashboard"     element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/chat"          element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/doctors"       element={<PrivateRoute><DoctorsPage /></PrivateRoute>} />
      <Route path="/appointments"  element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
      <Route path="/profile"       element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW failed:', err));
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PWARegistration />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}