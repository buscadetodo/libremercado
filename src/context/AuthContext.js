import React, { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticación. Mantiene el estado de sesión en un único lugar
 * para que todos los componentes (incluido PerfilProvider) reaccionen al
 * login/logout sin necesidad de recargar la página.
 */
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                         err.response?.data?.detail ||
                         'Error al iniciar sesión';

      setError(errorMessage);
      setIsAuthenticated(false);

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const refreshToken = localStorage.getItem('refresh_token');
      const result = await authService.refreshToken(refreshToken);
      setUser(authService.getCurrentUser());

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                         err.response?.data?.detail ||
                         'Error al refrescar token';

      setError(errorMessage);
      logout();

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const value = {
    login,
    logout,
    refresh,
    loading,
    error,
    isAuthenticated,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
