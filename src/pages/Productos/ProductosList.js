import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import { useRubros } from '../../hooks';
import productosService from '../../services/productosService';
import Pagination from '../../components/Pagination/Pagination';
import './Productos.css';

function ProductosList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { rubros, fetchRubros } = useRubros();
  const toast = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  // Filtros
  const [filters, setFilters] = useState({
    rubro_id: '',
    search: '',
  });

  useEffect(() => {
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await productosService.getAll({
        ...filters,
        limit: itemsPerPage,
        offset: offset,
      });
      
      setProductos(response.data || []);
      setTotalItems(response.total || response.data?.length || 0);
    } catch (err) {
      setError('Error al cargar productos');
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productosService.delete(id);
        toast.success('Producto eliminado correctamente');
        fetchProductos();
      } catch (err) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reset a la primera página
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProductos();
  };

  const getRubroName = (rubroId) => {
    if (!rubros) return 'N/A';
    const rubro = rubros.find((r) => r.id === rubroId);
    return rubro ? rubro.rubro : 'N/A';
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="productos-page">
      <div className="page-header">
        <div>
          <h1>📦 Catálogo de Productos</h1>
          <p className="page-subtitle">Gestiona los productos disponibles</p>
        </div>
        <Link to="/productos/nuevo" className="btn btn-primary">
          ➕ Nuevo Producto
        </Link>
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

          <button type="submit" className="btn btn-secondary">
            🔍 Buscar
          </button>
        </form>
      </div>

      {loading && <div className="loading">⏳ Cargando productos...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      {/* Grid de productos */}
      <div className="productos-grid">
        {productos && productos.length > 0 ? (
          productos.map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-image-placeholder">
                📦
              </div>
              <div className="producto-content">
                <h3 className="producto-nombre">{producto.nombre}</h3>
                <span className="producto-rubro">
                  {getRubroName(producto.rubro_id)}
                </span>
                <p className="producto-descripcion">
                  {producto.descripcion || 'Sin descripción'}
                </p>
                <div className="producto-precio">
                  <span className="precio-label">Precio:</span>
                  <span className="precio-valor">
                    ${parseFloat(producto.precio).toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="producto-stock">
                  <span className={`stock-badge ${producto.stock > 0 ? 'disponible' : 'agotado'}`}>
                    {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                  </span>
                </div>
              </div>
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
            </div>
          ))
        ) : (
          !loading && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No hay productos</h3>
              <p>Comienza agregando tu primer producto</p>
              <Link to="/productos/nuevo" className="btn btn-primary">
                ➕ Crear Producto
              </Link>
            </div>
          )
        )}
      </div>

      {/* Paginación */}
      {productos && productos.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default ProductosList;
