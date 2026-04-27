import React from 'react';
import { Link } from 'react-router-dom';
import '../Dashboard/Dashboard.css';

function MinoristaDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏪 Dashboard Minorista</h1>
        <p className="dashboard-subtitle">Panel de control para minoristas</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--color': '#667eea' }}>
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3 className="stat-title">Pedidos Realizados</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#764ba2' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-title">Productos Favoritos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#f093fb' }}>
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <h3 className="stat-title">Mayoristas</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#4facfe' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-title">Compras del Mes</h3>
            <p className="stat-count">$0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/productos" className="action-card" style={{ '--color': '#667eea' }}>
            <span className="action-icon">🔍</span>
            <span className="action-title">Buscar Productos</span>
          </Link>
          <Link to="/mayoristas" className="action-card" style={{ '--color': '#764ba2' }}>
            <span className="action-icon">🏭</span>
            <span className="action-title">Ver Mayoristas</span>
          </Link>
          <Link to="/perfil" className="action-card" style={{ '--color': '#f093fb' }}>
            <span className="action-icon">⚙️</span>
            <span className="action-title">Mi Perfil</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimos Pedidos</h2>
        <div className="activity-card">
          <p className="empty-state">No hay pedidos realizados</p>
        </div>
      </div>
    </div>
  );
}

export default MinoristaDashboard;
