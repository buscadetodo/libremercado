import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import minoristasService from '../../services/minoristasService';
import { useRubros } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import Pagination from '../../components/Pagination/Pagination';
import '../Mayoristas/Mayoristas.css';

function MinoristasList() {
  const [minoristas, setMinoristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { rubros, fetchRubros } = useRubros();
  const [filters, setFilters] = useState({ rubro_id: '' });
  const toast = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchMinoristas();
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMinoristas = async () => {
    try {
      setLoading(true);
      const response = await minoristasService.getAll(filters);
      setMinoristas(response.data || []);
    } catch (err) {
      setError('Error al cargar minoristas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este minorista?')) {
      try {
        await minoristasService.delete(id);
        toast.success('Minorista eliminado correctamente');
        fetchMinoristas();
      } catch (err) {
        toast.error('Error al eliminar minorista');
      }
    }
  };

  const getRubroName = (rubroId) => {
    if (!rubros) return 'N/A';
    const rubro = rubros.find(r => r.id === rubroId);
    return rubro ? rubro.rubro : 'N/A';
  };

  return (
    <div className="minoristas-page">
      <div className="page-header">
        <div>
          <h1>🏪 Minoristas</h1>
          <p className="page-subtitle">Gestiona los minoristas registrados</p>
        </div>
        <Link to="/minoristas/nuevo" className="btn btn-primary">
          ➕ Nuevo Minorista
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
          <button onClick={fetchMinoristas} className="btn btn-secondary">
            🔍 Buscar
          </button>
        </div>
      </div>

      {loading && <div className="loading">⏳ Cargando minoristas...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      <div className="minoristas-grid">
        {minoristas && minoristas.length > 0 ? (
          minoristas.map((minorista) => (
            <div key={minorista.id} className="minorista-card">
              <div className="minorista-header">
                <h3>{minorista.razon_social}</h3>
                <span className="rubro-badge">{getRubroName(minorista.rubro_id)}</span>
              </div>

              <div className="minorista-info">
                <div className="info-item">
                  <span className="info-label">CUIT:</span>
                  <span className="info-value">{minorista.cuit}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Pedido mínimo:</span>
                  <span className="info-value">${minorista.pedido_minimo}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Retiro en local:</span>
                  <span className="info-value">{minorista.retiro_en_local === 'y' ? '✅ Sí' : '❌ No'}</span>
                </div>
              </div>

              <p className="minorista-description">{minorista.descripcion}</p>

              <div className="minorista-actions">
                <Link to={`/minoristas/${minorista.id}/editar`} className="btn btn-primary btn-sm">
                  ✏️ Editar
                </Link>
                <button onClick={() => handleDelete(minorista.id)} className="btn btn-danger btn-sm">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay minoristas registrados</div>
        )}
      </div>

      {/* Paginación */}
      {minoristas && minoristas.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(minoristas.length / itemsPerPage)}
          totalItems={minoristas.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default MinoristasList;
