import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { esAdmin } from '../config/roles';

/**
 * Protege rutas privadas.
 * @param {Object} props
 * @param {boolean} [props.adminOnly] - Si es true, solo el rol administrador puede acceder.
 */
function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ruta solo para administradores: un usuario común se redirige a su inicio
  if (adminOnly && !esAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
