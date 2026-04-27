import React from 'react';
import { Link } from 'react-router-dom';
import '../Dashboard/Dashboard.css';

function MayoristaDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏭 Dashboard Mayorista</h1>
        <p className="dashboard-subtitle">Panel de control para mayoristas</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--color': '#667eea' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-title">Mis Productos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#764ba2' }}>
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3 className="stat-title">Pedidos Recibidos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#f093fb' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-title">Clientes</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#4facfe' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-title">Ventas del Mes</h3>
            <p className="stat-count">$0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/productos/nuevo" className="action-card" style={{ '--color': '#667eea' }}>
            <span className="action-icon">➕</span>
            <span className="action-title">Nuevo Producto</span>
          </Link>
          <Link to="/productos" className="action-card" style={{ '--color': '#764ba2' }}>
            <span className="action-icon">📦</span>
            <span className="action-title">Ver Productos</span>
          </Link>
          <Link to="/perfil" className="action-card" style={{ '--color': '#f093fb' }}>
            <span className="action-icon">⚙️</span>
            <span className="action-title">Configuración</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Pedidos Recientes</h2>
        <div className="activity-card">
          <p className="empty-state">No hay pedidos recientes</p>
        </div>
      </div>
    </div>
  );
}

export default MayoristaDashboard;
