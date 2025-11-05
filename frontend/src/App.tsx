import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import { motion } from 'framer-motion';
import { Card } from './components/ui/card';

// Components
import Header from './components/Header';
import Login from './components/Login';
import SplashLogin from './components/SplashLogin';
import PrivateRoute from './components/PrivateRoute';

// Modules
import Store from './modules/store/Store';
import StoreOwnerDashboard from './modules/owner/StoreOwnerDashboard';
import AdminDashboard from './modules/admin/AdminDashboard';
import { CPGDashboard } from './components/CPGDashboard';
import { ChatBot } from './components/ChatBot';

function ProfilePage() {
  const navigate = useNavigate();
  const { logout, userRole, currentUser } = useAuth();

  // Datos de perfil por usuario (mock)
  const PROFILES: Record<string, any> = {
    'test@gmail.com': {
      initials: 'JD',
      fullName: 'Juan Delgado',
      storeName: 'Tienda La Esquina',
      phone: '+52 81 1234 5678',
      city: 'Monterrey, NL',
      tipoCuenta: 'Usuario',
      joined: '2024-09-12',
      pedidos: 42,
    },
    'admin@gmail.com': {
      initials: 'AM',
      fullName: 'Ana Martínez',
      storeName: 'Geko CPG',
      phone: '+52 55 9876 5432',
      city: 'CDMX, MX',
      tipoCuenta: 'Administrador',
      joined: '2023-01-05',
      cuentasGestionadas: 128,
    },
  };

  const emailKey = currentUser?.email || '';
  const profile = PROFILES[emailKey] || {
    initials: (currentUser?.displayName || 'U').slice(0,2).toUpperCase(),
    fullName: currentUser?.displayName || 'Usuario',
    storeName: userRole === 'Admin' ? 'Geko CPG' : 'Mi Tienda',
    phone: '—',
    city: '—',
    tipoCuenta: userRole === 'Admin' ? 'Administrador' : 'Usuario',
    joined: '—',
  };

  const userData = {
    initials: profile.initials,
    fullName: profile.fullName,
    storeName: profile.storeName,
    email: currentUser?.email || '—',
  };
  const onLogout = async () => {
    try { await logout(); navigate('/login'); } catch {}
  };

  return (
    <main className="relative min-h-screen pb-20">
      {/* Fondo atmosférico */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #29BF12 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, #FFBA49 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#1a8a0a]">Perfil</h1>
                <p className="text-sm text-gray-600">Configuración de Usuario</p>
              </div>
              {userRole && (
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  padding:'6px 12px', borderRadius:9999, fontSize:12, fontWeight:700,
                  backgroundColor: userRole === 'Admin' ? '#FFBA49' : '#648DE5', color:'#fff'
                }}>
                  {userRole === 'Admin' ? 'Administrador' : 'Usuario'}
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Información de Usuario */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <Card className="p-6 flex flex-col items-center text-center gap-3">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#29BF12] to-[#FFBA49] text-white flex items-center justify-center text-2xl font-semibold shadow-md">{userData.initials}</div>
            <div className="text-lg font-semibold text-gray-900">{userData.fullName}</div>
            <div className="text-sm text-gray-700">{userData.storeName}</div>
            <div className="text-sm text-gray-600">{userData.email}</div>
          </Card>
        </motion.div>

        {/* Detalles adicionales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <Card className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                <div className="text-xs text-gray-500">Teléfono</div>
                <div className="text-sm text-gray-900">{profile.phone}</div>
              </div>
              <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                <div className="text-xs text-gray-500">Ubicación</div>
                <div className="text-sm text-gray-900">{profile.city}</div>
              </div>
              <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                <div className="text-xs text-gray-500">Tipo de Cuenta</div>
                <div className="text-sm text-gray-900">{profile.tipoCuenta}</div>
              </div>
              <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                <div className="text-xs text-gray-500">Miembro desde</div>
                <div className="text-sm text-gray-900">{profile.joined}</div>
              </div>
              {userRole !== 'Admin' && (
                <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                  <div className="text-xs text-gray-500">Pedidos Realizados</div>
                  <div className="text-sm text-gray-900">{profile.pedidos ?? '—'}</div>
                </div>
              )}
              {userRole === 'Admin' && (
                <div className="rounded-lg border border-white/60 bg-white/80 p-3">
                  <div className="text-xs text-gray-500">Cuentas Gestionadas</div>
                  <div className="text-sm text-gray-900">{profile.cuentasGestionadas ?? '—'}</div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Menú de Configuración */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="p-3 space-y-2">
            {[
              'Información Personal',
              'Configuración de Tienda',
              'Métodos de Pago',
              'Notificaciones',
              'Ayuda y Soporte',
            ].map((label) => (
              <button key={label} onClick={()=>{}} className="w-full text-left px-4 py-3 rounded-lg border border-white/60 bg-white/80 hover:bg-white shadow-sm transition">
                <span className="text-sm text-gray-800">{label}</span>
              </button>
            ))}
          </Card>
        </motion.div>

        {/* Cerrar Sesión */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <button onClick={onLogout} className="w-full h-11 rounded-lg bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white text-sm font-semibold shadow-md">
            Cerrar Sesión
          </button>
        </motion.div>
      </div>
    </main>
  );
}

function AppRoutes() {
  const { currentUser, userRole, signIn } = useAuth();
  const location = window.location.pathname;

  return (
    <>
      {currentUser && <Header />}
      {currentUser && <ChatBot />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={currentUser ? (userRole === 'Admin' ? <Navigate to="/cpg" /> : <Store />) : <Navigate to="/login" />} />
        <Route path="/store" element={<Store />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <SplashLogin onLogin={signIn} />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {userRole === 'Admin' ? (
                <Navigate to="/cpg" />
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
            <PrivateRoute>
              <StoreOwnerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/cpg"
          element={
            <PrivateRoute requiredRole="Admin">
              <CPGDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <ProfilePage />
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

