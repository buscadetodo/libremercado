import httpClient from '../api/httpClient';

const diasService = {
  /**
   * Obtener lista de días con paginación
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/dias/', { params });
    return response.data;
  },

  /**
   * Obtener un día por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/dias/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo día
   * @param {string} dia - ej: "Lunes"
   * @returns {Promise}
   */
  create: async (dia) => {
    const response = await httpClient.post('/dias/', { dia });
    return response.data;
  },

  /**
   * Actualizar un día
   * @param {number} id 
   * @param {string} dia 
   * @returns {Promise}
   */
  update: async (id, dia) => {
    const response = await httpClient.put(`/dias/${id}`, { dia });
    return response.data;
  },

  /**
   * Eliminar un día
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/dias/${id}`);
    return response.data;
  },
};

export default diasService;
