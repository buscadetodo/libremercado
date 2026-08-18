import httpClient from '../api/httpClient';

/**
 * Contrato del recurso Producto (confirmado contra la colección del backend):
 *   { id, mayorista_id, minorista_id, rubro_id, sku, nombre, descripcion,
 *     precio, stock, imagen_url, modificado, creado }
 *
 * Reglas del backend:
 *  - Exactamente UN oferente: mayorista_id o minorista_id (nunca los dos, nunca ninguno).
 *    Si se envían ambos la API responde 422.
 *  - El comercio indicado debe pertenecer al usuario del token, si no responde 403.
 *  - `precio` vuelve como string ("4500.00"); `stock` como number.
 *  - No existe `unidad_medida` en el contrato: no se envía.
 */

/**
 * Normaliza el body de alta/modificación al contrato de la API.
 * @param {Object} form - estado del formulario
 * @returns {Object} body listo para POST/PUT
 */
export const buildProductoPayload = (form) => {
  const esMayorista = form.oferente_tipo === 'mayorista';
  const oferenteId = Number(form.oferente_id);

  return {
    // Un solo oferente: el otro va explícitamente en null.
    mayorista_id: esMayorista ? oferenteId : null,
    minorista_id: esMayorista ? null : oferenteId,
    rubro_id: Number(form.rubro_id),
    sku: form.sku?.trim() || null,
    nombre: form.nombre?.trim() || '',
    descripcion: form.descripcion?.trim() || null,
    precio: Number(form.precio),
    stock: Number(form.stock),
    imagen_url: form.imagen_url?.trim() || null,
  };
};

const productosService = {
  /**
   * Obtener lista de productos con filtros y paginación
   * @param {Object} filters - { mayorista_id, minorista_id, rubro_id, search, limit, offset }
   * @returns {Promise} - { success, data: [] }  (la API todavía no devuelve `total`)
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.mayorista_id) params.mayorista_id = filters.mayorista_id;
    if (filters.minorista_id) params.minorista_id = filters.minorista_id;
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
   * Productos de un mayorista.
   * No existe GET /mayoristas/{id}/productos/: se resuelve con el filtro del listado.
   * @param {number} mayoristaId
   * @param {Object} filters - { rubro_id, search, limit, offset }
   * @returns {Promise}
   */
  getByMayorista: async (mayoristaId, filters = {}) => {
    return productosService.getAll({ ...filters, mayorista_id: mayoristaId });
  },

  /**
   * Productos de un minorista.
   * @param {number} minoristaId
   * @param {Object} filters - { rubro_id, search, limit, offset }
   * @returns {Promise}
   */
  getByMinorista: async (minoristaId, filters = {}) => {
    return productosService.getAll({ ...filters, minorista_id: minoristaId });
  },

  /**
   * Crear un nuevo producto
   * @param {Object} data - body ya normalizado (ver buildProductoPayload)
   * @returns {Promise} - { success, data: { id } }
   */
  create: async (data) => {
    const response = await httpClient.post('/productos/', data);
    return response.data;
  },

  /**
   * Actualizar un producto
   * @param {number} id
   * @param {Object} data - body ya normalizado (ver buildProductoPayload)
   * @returns {Promise} - { success, data: { filas_afectadas } }
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/productos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un producto
   * @param {number} id
   * @returns {Promise} - { success, data: { filas_afectadas } }
   */
  delete: async (id) => {
    const response = await httpClient.delete(`/productos/${id}`);
    return response.data;
  },
};

export default productosService;
