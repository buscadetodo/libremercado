import httpClient from '../api/httpClient';

const compradoresService = {
  /**
   * Obtener lista de compradores con filtros
   * @param {Object} filters - { id_usuario, limit, offset }
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.id_usuario) params.id_usuario = filters.id_usuario;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get('/comprador/', { params });
    return response.data;
  },

  /**
   * Obtener un comprador por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/comprador/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo comprador
   * @param {Object} data - { id_usuario, nombre, apellido }
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await httpClient.post('/comprador/', data);
    return response.data;
  },

  /**
   * Actualizar un comprador
   * @param {number} id 
   * @param {Object} data - { id_usuario, nombre, apellido }
   * @returns {Promise}
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/comprador/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un comprador
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/comprador/${id}`);
    return response.data;
  },
};

export default compradoresService;
