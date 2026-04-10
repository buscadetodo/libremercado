import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-animation">
          <div className="error-code">404</div>
          <div className="error-icon">🔍</div>
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
            🏠 Ir al Inicio
          </Link>
        </div>

        <div className="notfound-links">
          <p className="notfound-links-title">Enlaces útiles:</p>
          <div className="notfound-links-grid">
            <Link to="/dashboard" className="notfound-link">
              📊 Dashboard
            </Link>
            <Link to="/mayoristas" className="notfound-link">
              🏭 Mayoristas
            </Link>
            <Link to="/minoristas" className="notfound-link">
              🏪 Minoristas
            </Link>
            <Link to="/transportistas" className="notfound-link">
              🚚 Transportistas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
