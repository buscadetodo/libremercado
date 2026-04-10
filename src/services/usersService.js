import httpClient from '../api/httpClient';

const usersService = {
  /**
   * Obtener lista de usuarios con filtros
   * @param {Object} filters - { estado_cuenta, id_rol, limit, offset }
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.estado_cuenta) params.estado_cuenta = filters.estado_cuenta;
    if (filters.id_rol) params.id_rol = filters.id_rol;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get('/users/', { params });
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Registrar un nuevo usuario (público - no requiere auth)
   * @param {Object} userData 
   * @returns {Promise}
   */
  register: async (userData) => {
    const response = await httpClient.post('/users/', userData);
    return response.data;
  },

  /**
   * Actualizar datos de usuario
   * @param {number} id 
   * @param {Object} userData 
   * @returns {Promise}
   */
  update: async (id, userData) => {
    const response = await httpClient.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Baja lógica de usuario
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/users/${id}`);
    return response.data;
  },
};

export default usersService;
