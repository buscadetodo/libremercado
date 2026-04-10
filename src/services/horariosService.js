import httpClient from '../api/httpClient';

const horariosService = {
  /**
   * Obtener lista de horarios con paginación
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/horarios/', { params });
    return response.data;
  },

  /**
   * Obtener un horario por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/horarios/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo horario
   * @param {string} hora - ej: "09:00"
   * @returns {Promise}
   */
  create: async (hora) => {
    const response = await httpClient.post('/horarios/', { hora });
    return response.data;
  },

  /**
   * Actualizar un horario
   * @param {number} id 
   * @param {string} hora 
   * @returns {Promise}
   */
  update: async (id, hora) => {
    const response = await httpClient.put(`/horarios/${id}`, { hora });
    return response.data;
  },

  /**
   * Eliminar un horario
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/horarios/${id}`);
    return response.data;
  },
};

export default horariosService;
