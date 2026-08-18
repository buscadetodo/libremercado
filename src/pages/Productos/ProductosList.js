import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import { useRubros, useMisComercios } from '../../hooks';
import productosService from '../../services/productosService';
import './Productos.css';

const ITEMS_PER_PAGE = 12;

function ProductosList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { rubros, fetchRubros } = useRubros();
  const { opciones: comercios, isAdmin } = useMisComercios();
  const toast = useToast();

  // Paginación.
  // La API no devuelve `total`, así que no se puede calcular la cantidad de
  // páginas. Se pide un ítem extra (limit + 1): si vuelve, hay página siguiente.
  const [page, setPage] = useState(0);
  const [haySiguiente, setHaySiguiente] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    rubro_id: '',
    search: '',
    comercio: '', // "mayorista:3" | "minorista:1" | "" (todos)
  });

  useEffect(() => {
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tipo, comercioId] = filters.comercio
        ? filters.comercio.split(':')
        : [null, null];

      const response = await productosService.getAll({
        rubro_id: filters.rubro_id || undefined,
        search: filters.search || undefined,
        mayorista_id: tipo === 'mayorista' ? comercioId : undefined,
        minorista_id: tipo === 'minorista' ? comercioId : undefined,
        limit: ITEMS_PER_PAGE + 1,
        offset: page * ITEMS_PER_PAGE,
      });

      const data = Array.isArray(response?.data) ? response.data : [];

      // El ítem extra solo sirve para detectar la página siguiente: no se muestra.
      setHaySiguiente(data.length > ITEMS_PER_PAGE);
      setProductos(data.slice(0, ITEMS_PER_PAGE));
    } catch (err) {
      setError('Error al cargar productos');
      toast.error('Error al cargar productos');
      setProductos([]);
      setHaySiguiente(false);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productosService.delete(id);
      toast.success('Producto eliminado correctamente');
      fetchProductos();
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 403
          ? 'No podés eliminar productos de un comercio que no es tuyo.'
          : err.response?.data?.error || 'Error al eliminar producto';
      toast.error(msg);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(0); // Reset a la primera página
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProductos();
  };

  const getRubroName = (rubroId) => {
    if (!rubros) return 'N/A';
    const rubro = rubros.find((r) => r.id === rubroId);
    return rubro ? rubro.rubro : 'N/A';
  };

  // Solo se puede editar/borrar lo que la API va a aceptar: productos de un
  // comercio propio. El admin puede sobre todos.
  const puedeGestionar = (producto) => {
    if (isAdmin) return true;
    return comercios.some(
      (c) =>
        (c.tipo === 'mayorista' && c.id === producto.mayorista_id) ||
        (c.tipo === 'minorista' && c.id === producto.minorista_id)
    );
  };

  const nombreOferente = (producto) => {
    const match = comercios.find(
      (c) =>
        (c.tipo === 'mayorista' && c.id === producto.mayorista_id) ||
        (c.tipo === 'minorista' && c.id === producto.minorista_id)
    );
    if (match) return match.label;
    return producto.mayorista_id != null
      ? `Mayorista #${producto.mayorista_id}`
      : `Minorista #${producto.minorista_id}`;
  };

  const puedeCrear = isAdmin || comercios.length > 0;
  const desde = productos.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const hasta = page * ITEMS_PER_PAGE + productos.length;

  return (
    <div className="productos-page">
      <div className="page-header">
        <div>
          <h1>📦 Catálogo de Productos</h1>
          <p className="page-subtitle">Gestiona los productos disponibles</p>
        </div>
        {puedeCrear && (
          <Link to="/productos/nuevo" className="btn btn-primary">
            ➕ Nuevo Producto
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="filter-section">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-group">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por nombre..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <select
              name="rubro_id"
              value={filters.rubro_id}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos los rubros</option>
              {rubros &&
                rubros.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.rubro}
                  </option>
                ))}
            </select>
          </div>

          {comercios.length > 0 && (
            <div className="filter-group">
              <select
                name="comercio"
                value={filters.comercio}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Todos los comercios</option>
                {comercios.map((c) => (
                  <option key={`${c.tipo}:${c.id}`} value={`${c.tipo}:${c.id}`}>
                    {c.tipo === 'mayorista' ? '🏭' : '🏪'} {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-secondary">
            🔍 Buscar
          </button>
        </form>
      </div>

      {loading && <div className="loading">⏳ Cargando productos...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      {/* Grid de productos */}
      <div className="productos-grid">
        {productos.length > 0
          ? productos.map((producto) => (
              <div key={producto.id} className="producto-card">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="producto-image"
                    onError={(e) => {
                      // Si la URL está caída, se degrada al placeholder.
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="producto-image-placeholder">📦</div>
                )}
                <div className="producto-content">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  <div className="producto-meta">
                    {producto.sku && (
                      <span className="producto-sku">{producto.sku}</span>
                    )}
                    <span className="producto-rubro">
                      {getRubroName(producto.rubro_id)}
                    </span>
                  </div>
                  <span className="producto-oferente">
                    {producto.mayorista_id != null ? '🏭' : '🏪'}{' '}
                    {nombreOferente(producto)}
                  </span>
                  <p className="producto-descripcion">
                    {producto.descripcion || 'Sin descripción'}
                  </p>
                  <div className="producto-precio">
                    <span className="precio-label">Precio:</span>
                    <span className="precio-valor">
                      ${Number(producto.precio || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="producto-stock">
                    <span
                      className={`stock-badge ${
                        producto.stock > 0 ? 'disponible' : 'agotado'
                      }`}
                    >
                      {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                    </span>
                  </div>
                </div>
                {puedeGestionar(producto) && (
                  <div className="producto-actions">
                    <Link
                      to={`/productos/${producto.id}/editar`}
                      className="btn btn-sm btn-secondary"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="btn btn-sm btn-danger"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          : !loading && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No hay productos</h3>
                <p>
                  {page > 0
                    ? 'No hay más productos en esta página.'
                    : puedeCrear
                    ? 'Comienza agregando tu primer producto'
                    : 'Todavía no hay productos publicados.'}
                </p>
                {puedeCrear && page === 0 && (
                  <Link to="/productos/nuevo" className="btn btn-primary">
                    ➕ Crear Producto
                  </Link>
                )}
              </div>
            )}
      </div>

      {/* Paginación simple: la API no expone `total`, así que no hay números de
          página. Cuando el backend agregue `total` se puede volver al componente
          Pagination con numeración. */}
      {(page > 0 || haySiguiente) && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {desde} - {hasta}
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
            >
              ← Anterior
            </button>
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={!haySiguiente || loading}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductosList;
