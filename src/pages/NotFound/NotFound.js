import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-animation">
          <div className="error-code">404</div>
          <div className="error-icon"><Icon name="search" /></div>
        </div>
        
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-message">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Volver Atrás
          </button>
          <Link to="/" className="btn btn-primary">
            <Icon name="home" /> Ir al Inicio
          </Link>
        </div>

        <div className="notfound-links">
          <p className="notfound-links-title">Enlaces útiles:</p>
          <div className="notfound-links-grid">
            {/* Solo rutas públicas: las privadas redirigían al login sin sesión */}
            <Link to="/" className="notfound-link">
              Inicio
            </Link>
            <Link to="/login" className="notfound-link">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="notfound-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
