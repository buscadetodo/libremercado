import httpClient from '../api/httpClient';

const authService = {
  /**
   * Iniciar sesión con email y password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} - tokens JWT
   */
  login: async (email, password) => {
    const response = await httpClient.post('/auth/login', {
      email,
      password,
    });
    
    // Guardar tokens en localStorage
    const { access_token, refresh_token, user_id } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    // Intentar guardar user_id si viene en la respuesta
    if (user_id) {
      localStorage.setItem('user_id', user_id);
    } else {
      // Si no viene en la respuesta, intentar decodificar del token
      try {
        const payload = JSON.parse(atob(access_token.split('.')[1]));
        if (payload.user_id || payload.sub || payload.id) {
          localStorage.setItem('user_id', payload.user_id || payload.sub || payload.id);
        }
      } catch (err) {
        console.warn('No se pudo extraer user_id del token');
      }
    }
    
    return response.data;
  },

  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - datos del usuario creado
   */
  register: async (userData) => {
    const response = await httpClient.post('/users/', userData);
    return response.data;
  },

  /**
   * Refrescar access token
   * @param {string} refreshToken 
   * @returns {Promise} - nuevos tokens
   */
  refreshToken: async (refreshToken) => {
    const response = await httpClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Actualizar tokens
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  },

  /**
   * Cerrar sesión (limpiar tokens)
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Obtener access token actual
   * @returns {string|null}
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  /**
   * Obtener el usuario actual decodificando el JWT.
   * El token trae { sub, email, id_rol, exp, type }.
   * @returns {{id: string, email: string, id_rol: number}|null}
   */
  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      // Normalizar base64url → base64 antes de decodificar
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const id = payload.user_id || payload.sub || payload.id;
      return {
        id: id != null ? String(id) : null,
        email: payload.email || null,
        id_rol: payload.id_rol != null ? Number(payload.id_rol) : null,
      };
    } catch (err) {
      console.warn('No se pudo decodificar el usuario del token');
      return null;
    }
  },
};

export default authService;
