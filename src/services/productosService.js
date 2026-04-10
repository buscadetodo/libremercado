import httpClient from '../api/httpClient';

const productosService = {
  /**
   * Obtener lista de productos con filtros y paginación
   * @param {Object} filters - { mayorista_id, rubro_id, search, limit, offset }
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.mayorista_id) params.mayorista_id = filters.mayorista_id;
    if (filters.rubro_id) params.rubro_id = filters.rubro_id;
    if (filters.search) params.search = filters.search;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get('/productos/', { params });
    return response.data;
  },

  /**
   * Obtener un producto por ID
   * @param {number} id 
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await httpClient.get(`/productos/${id}`);
    return response.data;
  },

  /**
   * Obtener productos por mayorista
   * @param {number} mayoristaId 
   * @param {Object} filters 
   * @returns {Promise}
   */
  getByMayorista: async (mayoristaId, filters = {}) => {
    const params = { ...filters };
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await httpClient.get(`/mayorista/${mayoristaId}/productos/`, { params });
    return response.data;
  },

  /**
   * Crear un nuevo producto
   * @param {Object} data 
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await httpClient.post('/productos/', data);
    return response.data;
  },

  /**
   * Actualizar un producto
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise}
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/productos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un producto
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/productos/${id}`);
    return response.data;
  },
};

export default productosService;
