import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <h1>CabriThon</h1>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link to="/" className="nav-link">
            Store
          </Link>

          {currentUser ? (
            <>
              {userRole === 'Admin' && (
                <Link to="/admin" className="nav-link">
                  Admin Dashboard
                </Link>
              )}

              {userRole === 'StoreOwner' && (
                <Link to="/owner" className="nav-link">
                  My Store
                </Link>
              )}

              <div className="user-info">
                <span className="user-email">{currentUser.email}</span>
                {userRole && <span className="user-role">{userRole}</span>}
              </div>

              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

