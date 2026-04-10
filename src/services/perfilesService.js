import httpClient from '../api/httpClient';

const perfilesService = {
  /**
   * Obtener lista de perfiles con paginación
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/perfiles/', { params });
    return response.data;
  },

  /**
   * Obtener un perfil por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/perfiles/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo perfil
   * @param {string} perfil - ej: "mayorista", "minorista"
   * @returns {Promise}
   */
  create: async (perfil) => {
    const response = await httpClient.post('/perfiles/', { perfil });
    return response.data;
  },

  /**
   * Actualizar un perfil
   * @param {number} id 
   * @param {string} perfil 
   * @returns {Promise}
   */
  update: async (id, perfil) => {
    const response = await httpClient.put(`/perfiles/${id}`, { perfil });
    return response.data;
  },

  /**
   * Eliminar un perfil
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/perfiles/${id}`);
    return response.data;
  },
};

export default perfilesService;
