import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏪</span>
          <span className="logo-text">Libre Mercado</span>
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/mayoristas" className="navbar-link">
                Mayoristas
              </Link>
              <Link to="/minoristas" className="navbar-link">
                Minoristas
              </Link>
              <Link to="/transportistas" className="navbar-link">
                Transportistas
              </Link>
              <button onClick={handleLogout} className="navbar-button navbar-logout">
                <span>🚪</span> Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-button navbar-login">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="navbar-button navbar-register">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
