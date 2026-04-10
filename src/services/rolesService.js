import httpClient from '../api/httpClient';

const rolesService = {
  /**
   * Obtener lista de roles con paginación
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise}
   */
  getAll: async (limit, offset) => {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await httpClient.get('/roles/', { params });
    return response.data;
  },

  /**
   * Obtener un rol por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo rol
   * @param {string} rol - ej: "usuario", "administrador"
   * @returns {Promise}
   */
  create: async (rol) => {
    const response = await httpClient.post('/roles/', { rol });
    return response.data;
  },

  /**
   * Actualizar un rol
   * @param {number} id 
   * @param {string} rol 
   * @returns {Promise}
   */
  update: async (id, rol) => {
    const response = await httpClient.put(`/roles/${id}`, { rol });
    return response.data;
  },

  /**
   * Eliminar un rol
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/roles/${id}`);
    return response.data;
  },
};

export default rolesService;
