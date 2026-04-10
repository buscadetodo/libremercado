import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/mayoristas', icon: '🏭', label: 'Mayoristas' },
    { path: '/minoristas', icon: '🏪', label: 'Minoristas' },
    { path: '/transportistas', icon: '🚚', label: 'Transportistas' },
    { path: '/compradores', icon: '🛒', label: 'Compradores' },
    { path: '/productos', icon: '📦', label: 'Productos' },
    { path: '/rubros', icon: '📂', label: 'Rubros' },
    { path: '/usuarios', icon: '👥', label: 'Usuarios' },
    { path: '/perfil', icon: '⚙️', label: 'Mi Perfil' },
  ];

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
