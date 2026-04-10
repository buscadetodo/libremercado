import httpClient from '../api/httpClient';

const transportistasService = {
  /**
   * Obtener lista de transportistas con filtros
   * @param {Object} filters - { id_usuario, limit, offset }
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.id_usuario) params.id_usuario = filters.id_usuario;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get('/transportista/', { params });
    return response.data;
  },

  /**
   * Obtener un transportista por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/transportista/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo transportista
   * @param {Object} data 
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await httpClient.post('/transportista/', data);
    return response.data;
  },

  /**
   * Actualizar un transportista
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise}
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/transportista/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un transportista
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/transportista/${id}`);
    return response.data;
  },
};

export default transportistasService;
