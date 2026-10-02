import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import minoristasService from '../../services/minoristasService';
import { useRubros, useAuth } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import { esAdmin } from '../../config/roles';
import Pagination from '../../components/Pagination/Pagination';
import Icon from '../../components/Icon/Icon';
import '../Mayoristas/Mayoristas.css';

function MinoristasList() {
  const [minoristas, setMinoristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { rubros, fetchRubros } = useRubros();
  const { user } = useAuth();
  const isAdmin = esAdmin(user);
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
          <h1><Icon name="minorista" /> Minoristas</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Gestiona los minoristas registrados' : 'Explorá los minoristas disponibles'}
          </p>
        </div>
        {isAdmin && (
          <Link to="/minoristas/nuevo" className="btn btn-primary">
            <Icon name="add" /> Nuevo Minorista
          </Link>
        )}
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
            <Icon name="search" /> Buscar
          </button>
        </div>
      </div>

      {loading && <div className="loading"><Icon name="loading" /> Cargando minoristas...</div>}
      {error && <div className="error-message"><Icon name="error" /> {error}</div>}

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
                  <span className="info-value">{minorista.retiro_en_local === 'y' ? <><Icon name="success" /> Sí</> : <><Icon name="error" /> No</>}</span>
                </div>
              </div>

              <p className="minorista-description">{minorista.descripcion}</p>

              {isAdmin && (
                <div className="minorista-actions">
                  <Link to={`/minoristas/${minorista.id}/editar`} className="btn btn-primary btn-sm">
                    <Icon name="edit" /> Editar
                  </Link>
                  <button onClick={() => handleDelete(minorista.id)} className="btn btn-danger btn-sm">
                    <Icon name="delete" /> Eliminar
                  </button>
                </div>
              )}
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
