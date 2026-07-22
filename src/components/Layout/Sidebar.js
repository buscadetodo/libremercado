import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { usePerfilActivo } from '../../context/PerfilContext';
import { esAdmin } from '../../config/roles';
import { FEATURE_PRODUCTOS } from '../../config/features';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { perfilActivo, obtenerDashboardUrl } = usePerfilActivo();

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
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
