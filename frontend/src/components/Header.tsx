import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Logo from './Logo';
import { Home, LayoutDashboard, Building2, User as UserIcon, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => { document.body.style.overflow = original || ''; };
  }, [menuOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
                  <Link to="/owner" className="nav-link"><LayoutDashboard size={16} style={{marginRight:8}}/>Panel</Link>
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

        {currentUser && (
          <button className="burger-btn" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
        )}

        {menuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
              <div className="mobile-menu-header">
                <span>Menú</span>
                <button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="mobile-menu-content">
                {userRole === 'Admin' ? (
                  <>
                    <Link to="/cpg" className="mobile-link" onClick={() => setMenuOpen(false)}><Building2 size={16} style={{marginRight:8}}/>Panel CPG</Link>
                    <Link to="/perfil" className="mobile-link" onClick={() => setMenuOpen(false)}><UserIcon size={16} style={{marginRight:8}}/>Perfil</Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}><Home size={16} style={{marginRight:8}}/>Tienda</Link>
                    <Link to="/owner" className="mobile-link" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} style={{marginRight:8}}/>Panel</Link>
                    <Link to="/perfil" className="mobile-link" onClick={() => setMenuOpen(false)}><UserIcon size={16} style={{marginRight:8}}/>Perfil</Link>
                  </>
                )}
                <div className="mobile-user">
                  <span className="mobile-email">{currentUser?.email}</span>
                  <button onClick={handleLogout} className="mobile-logout">Salir</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

