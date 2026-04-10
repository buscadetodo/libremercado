import { useState, useCallback } from 'react';
import authService from '../services/authService';

/**
 * Hook personalizado para autenticación
 * @returns {Object}
 */
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  /**
   * Login
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      setIsAuthenticated(true);
      
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

  /**
   * Logout
   */
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Refresh token
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const refreshToken = localStorage.getItem('refresh_token');
      const result = await authService.refreshToken(refreshToken);
      
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

  return {
    login,
    logout,
    refresh,
    loading,
    error,
    isAuthenticated,
  };
};

export default useAuth;
