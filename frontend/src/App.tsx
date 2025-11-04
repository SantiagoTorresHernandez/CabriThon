import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Components
import Header from './components/Header';
import Login from './components/Login';
import SplashLogin from './components/SplashLogin';
import PrivateRoute from './components/PrivateRoute';

// Modules
import Store from './modules/store/Store';
import StoreOwnerDashboard from './modules/owner/StoreOwnerDashboard';
import AdminDashboard from './modules/admin/AdminDashboard';

function AppRoutes() {
  const { currentUser, userRole, signIn } = useAuth();
  const location = window.location.pathname;

  return (
    <>
      {currentUser && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={currentUser ? <Store /> : <Navigate to="/login" />} />
        <Route path="/store" element={<Store />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <SplashLogin onLogin={signIn} />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {userRole === 'Admin' ? (
                <Navigate to="/admin" />
              ) : userRole === 'StoreOwner' ? (
                <Navigate to="/owner" />
              ) : (
                <Navigate to="/" />
              )}
            </PrivateRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <PrivateRoute requiredRole="StoreOwner">
              <StoreOwnerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="Admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

