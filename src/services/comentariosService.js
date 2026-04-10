import httpClient from '../api/httpClient';

const comentariosService = {
  /**
   * Obtener lista de comentarios con paginación
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/comentarios/', { params });
    return response.data;
  },

  /**
   * Obtener un comentario por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/comentarios/${id}`);
    return response.data;
  },

  /**
   * Crear un comentario
   * @returns {Promise}
   */
  create: async () => {
    const response = await httpClient.post('/comentarios/');
    return response.data;
  },

  /**
   * Eliminar un comentario
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/comentarios/${id}`);
    return response.data;
  },
};

export default comentariosService;
