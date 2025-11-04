import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Logo from './Logo';

const Header: React.FC = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="header" style={{ backdropFilter: 'saturate(150%) blur(6px)' }}>
      <div className="container header-content">
        <Link to="/" className="logo" aria-label="Inicio">
          <Logo />
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          <Link to="/" className="nav-link">
            Tienda
          </Link>

          {currentUser ? (
            <>
              {userRole === 'Admin' && (
                <Link to="/admin" className="nav-link">
                  Administrador
                </Link>
              )}

              {userRole === 'StoreOwner' && (
                <Link to="/owner" className="nav-link">
                  Mi Tienda
                </Link>
              )}

              <div className="user-info">
                <span className="user-email">{currentUser.email}</span>
                {userRole && <span className="user-role">{userRole}</span>}
              </div>

              <button onClick={handleLogout} className="btn btn-secondary">
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

