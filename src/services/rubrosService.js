import httpClient from '../api/httpClient';

const rubrosService = {
  /**
   * Obtener lista de rubros con paginación
   * @param {number} limit - límite de resultados
   * @param {number} offset - desplazamiento
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/rubros/', { params });
    return response.data;
  },

  /**
   * Obtener un rubro por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/rubros/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo rubro
   * @param {string} rubro - nombre del rubro
   * @returns {Promise}
   */
  create: async (rubro) => {
    const response = await httpClient.post('/rubros/', { rubro });
    return response.data;
  },

  /**
   * Actualizar un rubro
   * @param {number} id 
   * @param {string} rubro - nuevo nombre
   * @returns {Promise}
   */
  update: async (id, rubro) => {
    const response = await httpClient.put(`/rubros/${id}`, { rubro });
    return response.data;
  },

  /**
   * Eliminar un rubro
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/rubros/${id}`);
    return response.data;
  },
};

export default rubrosService;
