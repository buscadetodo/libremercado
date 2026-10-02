import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useFichaComercial } from '../../hooks';
import { usePerfilActivo } from '../../context/PerfilContext';
import { esAdmin } from '../../config/roles';
import { FEATURE_PRODUCTOS } from '../../config/features';
import { APP_VERSION } from '../../config/version';
import Modal from '../Modal/Modal';
import './Sidebar.css';

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { perfilActivo, obtenerDashboardUrl, sinNingunPerfil } = usePerfilActivo();
  const { tiposFaltantes } = useFichaComercial();
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

  // El acceso al alta se muestra cuando el usuario quedó a mitad de camino:
  // sin ningún perfil (el registro no lo completó) o con el perfil asignado
  // pero sin su ficha. En ambos casos no puede operar y necesita volver ahí.
  const esComercio = tiposFaltantes.some((t) => t === 'mayorista' || t === 'minorista');
  const altaPendiente = sinNingunPerfil
    ? { path: '/agregar-perfil', icon: '👤', label: 'Elegir mi perfil', destacado: true }
    : tiposFaltantes.length > 0
    ? {
        path: '/agregar-perfil',
        icon: esComercio ? '🏬' : '📝',
        // Transportista y comprador no tienen "comercio": el texto sería confuso.
        label: esComercio ? 'Dar de alta mi comercio' : 'Completar mi alta',
        destacado: true,
      }
    : null;

  const userMenu = [
    { path: inicioUrl, icon: '🏠', label: 'Inicio' },
    ...(altaPendiente ? [altaPendiente] : []),
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
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''} ${
              item.destacado ? 'sidebar-item-destacado' : ''
            }`}
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
        <Modal
          onClose={() => setShowLogoutConfirm(false)}
          titleId="logout-modal-titulo"
          overlayClassName="logout-modal-overlay"
          className="logout-modal"
        >
          <div className="logout-modal-icon" aria-hidden="true">🚪</div>
          <h3 id="logout-modal-titulo">¿Cerrar sesión?</h3>
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
        </Modal>
      )}
    </>
  );
}

export default Sidebar;
