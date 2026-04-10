import httpClient from '../api/httpClient';

const minoristasService = {
  /**
   * Obtener lista de minoristas con filtros
   * @param {Object} filters - { id_usuario, rubro_id, limit, offset }
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.id_usuario) params.id_usuario = filters.id_usuario;
    if (filters.rubro_id) params.rubro_id = filters.rubro_id;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get('/minorista/', { params });
    return response.data;
  },

  /**
   * Obtener un minorista por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/minorista/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo minorista
   * @param {Object} data 
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await httpClient.post('/minorista/', data);
    return response.data;
  },

  /**
   * Actualizar un minorista
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise}
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/minorista/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un minorista
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/minorista/${id}`);
    return response.data;
  },
};

export default minoristasService;
