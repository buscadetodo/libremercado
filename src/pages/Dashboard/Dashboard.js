import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const stats = [
    { title: 'Mayoristas', count: '0', icon: '🏭', color: '#667eea', link: '/mayoristas' },
    { title: 'Minoristas', count: '0', icon: '🏪', color: '#764ba2', link: '/minoristas' },
    { title: 'Transportistas', count: '0', icon: '🚚', color: '#f093fb', link: '/transportistas' },
    { title: 'Compradores', count: '0', icon: '🛒', color: '#4facfe', link: '/compradores' },
  ];

  const quickActions = [
    { title: 'Nuevo Mayorista', icon: '➕', link: '/mayoristas/nuevo', color: '#667eea' },
    { title: 'Nuevo Minorista', icon: '➕', link: '/minoristas/nuevo', color: '#764ba2' },
    { title: 'Ver Rubros', icon: '📂', link: '/rubros', color: '#f093fb' },
    { title: 'Gestionar Usuarios', icon: '👥', link: '/usuarios', color: '#4facfe' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Bienvenido a Libre Mercado</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index} className="stat-card" style={{ '--color': stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-count">{stat.count}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link to={action.link} key={index} className="action-card" style={{ '--color': action.color }}>
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Actividad Reciente</h2>
        <div className="activity-card">
          <p className="empty-state">No hay actividad reciente</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
