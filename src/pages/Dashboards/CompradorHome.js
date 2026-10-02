import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURE_PRODUCTOS } from '../../config/features';
import Icon from '../../components/Icon/Icon';
import '../Dashboard/Dashboard.css';

function CompradorHome() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1><Icon name="comprador" /> Bienvenido, Comprador</h1>
        <p className="dashboard-subtitle">Encuentra los mejores productos al por mayor</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--color': '#667eea' }}>
          <div className="stat-icon"><Icon name="cart" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Mi Carrito</h3>
            <p className="stat-count">0 productos</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#764ba2' }}>
          <div className="stat-icon"><Icon name="package" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Pedidos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#f093fb' }}>
          <div className="stat-icon"><Icon name="heart" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Favoritos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#4facfe' }}>
          <div className="stat-icon"><Icon name="transportista" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Fletes</h3>
            <p className="stat-count">0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>¿Qué estás buscando?</h2>
        <div className="actions-grid">
          {FEATURE_PRODUCTOS && (
            <Link to="/productos" className="action-card" style={{ '--color': '#667eea' }}>
              <span className="action-icon"><Icon name="search" /></span>
              <span className="action-title">Buscar Productos</span>
            </Link>
          )}
          <Link to="/mayoristas" className="action-card" style={{ '--color': '#764ba2' }}>
            <span className="action-icon"><Icon name="mayorista" /></span>
            <span className="action-title">Ver Mayoristas</span>
          </Link>
          <Link to="/perfil" className="action-card" style={{ '--color': '#f093fb' }}>
            <span className="action-icon"><Icon name="user" /></span>
            <span className="action-title">Mi Perfil</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h2><Icon name="hot" /> Ofertas Destacadas</h2>
        <div className="activity-card">
          <p className="empty-state">No hay ofertas disponibles en este momento</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Historial de Compras</h2>
        <div className="activity-card">
          <p className="empty-state">Aún no realizaste ninguna compra</p>
        </div>
      </div>
    </div>
  );
}

export default CompradorHome;
