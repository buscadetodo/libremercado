import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { usePerfilActivo } from '../../context/PerfilContext';
import { esAdmin } from '../../config/roles';
import { FEATURE_PRODUCTOS } from '../../config/features';
import { APP_VERSION } from '../../config/version';
import './Sidebar.css';

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { perfilActivo, obtenerDashboardUrl } = usePerfilActivo();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmarLogout = () => {
    setShowLogoutConfirm(false);
    if (onNavigate) onNavigate();
    logout();
    navigate('/login');
  };

  // Menú completo de administración
  const adminMenu = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/mayoristas', icon: '🏭', label: 'Mayoristas' },
    { path: '/minoristas', icon: '🏪', label: 'Minoristas' },
    { path: '/transportistas', icon: '🚚', label: 'Transportistas' },
    { path: '/compradores', icon: '🛒', label: 'Compradores' },
    { path: '/productos', icon: '📦', label: 'Productos', feature: FEATURE_PRODUCTOS },
    { path: '/rubros', icon: '📂', label: 'Rubros' },
    { path: '/usuarios', icon: '👥', label: 'Usuarios' },
    { path: '/perfil', icon: '⚙️', label: 'Mi Perfil' },
  ];

  // Menú para usuarios comunes: solo lo suyo
  const inicioUrl = (() => {
    if (!perfilActivo) return '/';
    const url = obtenerDashboardUrl(perfilActivo);
    // Si no se pudo mapear (cae en /dashboard, que es admin), usar el home público
    return url === '/dashboard' ? '/' : url;
  })();

  const userMenu = [
    { path: inicioUrl, icon: '🏠', label: 'Inicio' },
    { path: '/mayoristas', icon: '🏭', label: 'Explorar mayoristas' },
    { path: '/perfil', icon: '⚙️', label: 'Mi Perfil' },
  ];

  const menuItems = (esAdmin(user) ? adminMenu : userMenu).filter(
    (item) => item.feature !== false
  );

  return (
    <>
      <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            onClick={onNavigate}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-item sidebar-logout"
          onClick={() => setShowLogoutConfirm(true)}
          title="Cerrar sesión"
        >
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Cerrar sesión</span>
        </button>
        <div className="sidebar-version">v{APP_VERSION}</div>
      </div>
      </aside>

      {showLogoutConfirm && (
        <div
          className="logout-modal-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">🚪</div>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Seguro que querés salir de tu cuenta?</p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="logout-modal-confirm"
                onClick={confirmarLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
