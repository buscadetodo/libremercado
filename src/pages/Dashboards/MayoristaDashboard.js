import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURE_PRODUCTOS } from '../../config/features';
import { useFichaComercial } from '../../hooks';
import AvisoFichaComercial from '../../components/AvisoFichaComercial/AvisoFichaComercial';
import Icon from '../../components/Icon/Icon';
import '../Dashboard/Dashboard.css';

function MayoristaDashboard() {
  // Sin ficha comercial la API rechaza el alta de productos: ofrecer "Nuevo
  // Producto" sería mandarlo a un error que no puede resolver desde ahí.
  const { tiposFaltantes } = useFichaComercial();
  const sinFicha = tiposFaltantes.includes('mayorista');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1><Icon name="mayorista" /> Dashboard Mayorista</h1>
        <p className="dashboard-subtitle">Panel de control para mayoristas</p>
      </div>

      <AvisoFichaComercial tipo="mayorista" />

      <div className="stats-grid">
        <div className="stat-card" style={{ '--color': '#667eea' }}>
          <div className="stat-icon"><Icon name="package" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Mis Productos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#764ba2' }}>
          <div className="stat-icon"><Icon name="comprador" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Pedidos Recibidos</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#f093fb' }}>
          <div className="stat-icon"><Icon name="users" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Clientes</h3>
            <p className="stat-count">0</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--color': '#4facfe' }}>
          <div className="stat-icon"><Icon name="money" /></div>
          <div className="stat-content">
            <h3 className="stat-title">Ventas del Mes</h3>
            <p className="stat-count">$0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          {sinFicha ? (
            <Link to="/agregar-perfil" className="action-card" style={{ '--color': '#f59e0b' }}>
              <span className="action-icon"><Icon name="local" /></span>
              <span className="action-title">Dar de alta mi comercio</span>
            </Link>
          ) : (
            FEATURE_PRODUCTOS && (
              <>
                <Link to="/productos/nuevo" className="action-card" style={{ '--color': '#667eea' }}>
                  <span className="action-icon"><Icon name="add" /></span>
                  <span className="action-title">Nuevo Producto</span>
                </Link>
                <Link to="/productos" className="action-card" style={{ '--color': '#764ba2' }}>
                  <span className="action-icon"><Icon name="package" /></span>
                  <span className="action-title">Ver Productos</span>
                </Link>
              </>
            )
          )}
          <Link to="/perfil" className="action-card" style={{ '--color': '#f093fb' }}>
            <span className="action-icon"><Icon name="settings" /></span>
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
