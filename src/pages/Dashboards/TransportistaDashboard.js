import React from 'react';
import { Link } from 'react-router-dom';
import '../Dashboard/Dashboard.css';

function TransportistaDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🚚 Dashboard Transportista</h1>
        <p className="dashboard-subtitle">Panel de control para servicios de transporte</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--color': '#667eea' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-title">Solicitudes Pendientes</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#764ba2' }}>
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3 className="stat-title">Viajes Activos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#f093fb' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-title">Viajes Completados</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#4facfe' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-title">Ingresos del Mes</h3>
            <p className="stat-count">$0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/transportistas" className="action-card" style={{ '--color': '#667eea' }}>
            <span className="action-icon">🚚</span>
            <span className="action-title">Ver Solicitudes</span>
          </Link>
          <Link to="/perfil" className="action-card" style={{ '--color': '#764ba2' }}>
            <span className="action-icon">⚙️</span>
            <span className="action-title">Configurar Tarifas</span>
          </Link>
          <Link to="/perfil" className="action-card" style={{ '--color': '#f093fb' }}>
            <span className="action-icon">📊</span>
            <span className="action-title">Ver Estadísticas</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Solicitudes Recientes</h2>
        <div className="activity-card">
          <p className="empty-state">No hay solicitudes de flete pendientes</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Historial de Viajes</h2>
        <div className="activity-card">
          <p className="empty-state">No hay viajes registrados</p>
        </div>
      </div>
    </div>
  );
}

export default TransportistaDashboard;
