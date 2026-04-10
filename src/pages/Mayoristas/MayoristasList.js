import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMayoristas, useRubros } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import Pagination from '../../components/Pagination/Pagination';
import './Mayoristas.css';

function MayoristasList() {
  const { mayoristas, loading, error, fetchMayoristas, deleteMayorista } = useMayoristas();
  const { rubros, fetchRubros } = useRubros();
  const [filters, setFilters] = useState({ rubro_id: '' });
  const toast = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalItems = mayoristas?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Paginación local
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMayoristas = mayoristas?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    fetchMayoristas(filters);
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchMayoristas(filters);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este mayorista?')) {
      const result = await deleteMayorista(id);
      if (result.success) {
        toast.success('Mayorista eliminado correctamente');
        fetchMayoristas(filters);
      } else {
        toast.error(result.error || 'Error al eliminar mayorista');
      }
    }
  };

  const getRubroName = (rubroId) => {
    if (!rubros) return 'N/A';
    const rubro = rubros.find(r => r.id === rubroId);
    return rubro ? rubro.rubro : 'N/A';
  };

  return (
    <div className="mayoristas-page">
      <div className="page-header">
        <div>
          <h1>🏭 Mayoristas</h1>
          <p className="page-subtitle">Gestiona los mayoristas registrados</p>
        </div>
        <Link to="/mayoristas/nuevo" className="btn btn-primary">
          ➕ Nuevo Mayorista
        </Link>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Filtrar por Rubro:</label>
          <select
            value={filters.rubro_id}
            onChange={(e) => setFilters({ ...filters, rubro_id: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos los rubros</option>
            {rubros && rubros.map((rubro) => (
              <option key={rubro.id} value={rubro.id}>
                {rubro.rubro}
              </option>
            ))}
          </select>
          <button onClick={handleFilter} className="btn btn-secondary">
            🔍 Buscar
          </button>
        </div>
      </div>

      {loading && <div className="loading">⏳ Cargando mayoristas...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      <div className="mayoristas-grid">
        {paginatedMayoristas && paginatedMayoristas.length > 0 ? (
          paginatedMayoristas.map((mayorista) => (
            <div key={mayorista.id} className="mayorista-card">
              <div className="mayorista-header">
                <h3>{mayorista.razon_social}</h3>
                <span className="rubro-badge">{getRubroName(mayorista.rubro_id)}</span>
              </div>
              <div className="mayorista-info">
                <div className="info-item">
                  <span className="info-label">CUIT:</span>
                  <span className="info-value">{mayorista.cuit}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Pedido mínimo:</span>
                  <span className="info-value">${mayorista.pedido_minimo}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Retiro en local:</span>
                  <span className="info-value">{mayorista.retiro_en_local === 'y' ? '✅ Sí' : '❌ No'}</span>
                </div>
              </div>

              <p className="mayorista-description">{mayorista.descripcion}</p>

              <div className="mayorista-actions">
                <Link to={`/mayoristas/${mayorista.id}`} className="btn btn-secondary btn-sm">
                  👁️ Ver Detalles
                </Link>
                <Link to={`/mayoristas/${mayorista.id}/editar`} className="btn btn-primary btn-sm">
                  ✏️ Editar
                </Link>
                <button onClick={() => handleDelete(mayorista.id)} className="btn btn-danger btn-sm">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay mayoristas registrados</div>
        )}
      </div>

      {/* Paginación */}
      {mayoristas && mayoristas.length > 0 && totalPages > 1 && (
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

export default MayoristasList;
