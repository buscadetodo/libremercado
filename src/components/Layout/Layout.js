import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from '../Footer/Footer';
import './Layout.css';

function Layout({ children }) {
  // Colapso del sidebar en desktop (solo íconos)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  );
  // Drawer del sidebar en mobile (abierto/cerrado)
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // El botón hamburguesa colapsa en desktop y abre/cierra el drawer en mobile
  const handleToggleSidebar = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((c) => !c);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const layoutClass = [
    'layout',
    collapsed ? 'sidebar-collapsed' : '',
    mobileOpen ? 'sidebar-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layoutClass}>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <div className="layout-content">
        <Sidebar onNavigate={closeMobile} />
        <div
          className="sidebar-overlay"
          onClick={closeMobile}
          aria-hidden="true"
        />
        <main className="main-content">
          <div className="main-body">{children}</div>
          <Footer variant="compact" />
        </main>
      </div>
    </div>
  );
}

export default Layout;
