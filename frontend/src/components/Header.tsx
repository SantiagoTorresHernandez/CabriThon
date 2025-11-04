import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Logo from './Logo';
import { Home, LayoutDashboard, Building2, User as UserIcon } from 'lucide-react';

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
        <Link to="/" className="logo" aria-label="Inicio" style={{ display:'inline-block', lineHeight: 0 }}>
          <div style={{ width: 'clamp(90px, 14vw, 160px)' }}>
            <Logo />
          </div>
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          {currentUser ? (
            <>
              {userRole === 'Admin' ? (
                <>
                  <Link to="/cpg" className="nav-link"><Building2 size={16} style={{marginRight:8}}/>Panel CPG</Link>
                  <Link to="/perfil" className="nav-link"><UserIcon size={16} style={{marginRight:8}}/>Perfil</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link"><Home size={16} style={{marginRight:8}}/>Tienda</Link>
                  <Link to="/owner" className="nav-link"><LayoutDashboard size={16} style={{marginRight:8}}/>Mi Tienda</Link>
                  <Link to="/perfil" className="nav-link"><UserIcon size={16} style={{marginRight:8}}/>Perfil</Link>
                </>
              )}

              <div className="user-info">
                <span className="user-email" style={{ color: '#6b7280' }}>{currentUser.email}</span>
              </div>

              <button onClick={handleLogout} className="btn" style={{ backgroundColor:'#F06449', color:'#fff' }}>
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

