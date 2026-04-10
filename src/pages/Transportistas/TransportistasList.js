import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import transportistasService from '../../services/transportistasService';
import { useToast } from '../../components/Toast/Toast';
import Pagination from '../../components/Pagination/Pagination';
import '../Mayoristas/Mayoristas.css';

function TransportistasList() {
  const [transportistas, setTransportistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchTransportistas();
  }, []);

  const fetchTransportistas = async () => {
    try {
      setLoading(true);
      const response = await transportistasService.getAll();
      setTransportistas(response.data || []);
    } catch (err) {
      setError('Error al cargar transportistas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este transportista?')) {
      try {
        await transportistasService.delete(id);
        toast.success('Transportista eliminado correctamente');
        fetchTransportistas();
      } catch (err) {
        toast.error('Error al eliminar transportista');
      }
    }
  };

  return (
    <div className="transportistas-page">
      <div className="page-header">
        <div>
          <h1>🚚 Transportistas</h1>
          <p className="page-subtitle">Gestiona los transportistas registrados</p>
        </div>
        <Link to="/transportistas/nuevo" className="btn btn-primary">
          ➕ Nuevo Transportista
        </Link>
      </div>

      {loading && <div className="loading">⏳ Cargando transportistas...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      <div className="transportistas-grid">
        {transportistas && transportistas.length > 0 ? (
          transportistas
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((transportista) => (
            <div key={transportista.id} className="transportista-card">
              <div className="transportista-header">
                <h3>{transportista.tipo_vehiculo}</h3>
                <span className="rubro-badge">{transportista.patente}</span>
              </div>

              <div className="transportista-info">
                <div className="info-item">
                  <span className="info-label">Capacidad:</span>
                  <span className="info-value">{transportista.capacidad_carga}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Refrigerado:</span>
                  <span className="info-value">{transportista.refrigerado === 'y' ? '❄️ Sí' : '❌ No'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Precio Base:</span>
                  <span className="info-value">${transportista.precio_base}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Precio por KM:</span>
                  <span className="info-value">${transportista.precio_por_km}/km</span>
                </div>
              </div>

              <p className="transportista-description">{transportista.descripcion}</p>

              <div className="transportista-actions">
                <Link to={`/transportistas/${transportista.id}/editar`} className="btn btn-primary btn-sm">
                  ✏️ Editar
                </Link>
                <button onClick={() => handleDelete(transportista.id)} className="btn btn-danger btn-sm">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay transportistas registrados</div>
        )}
      </div>

      {/* Paginación */}
      {transportistas && transportistas.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(transportistas.length / itemsPerPage)}
          totalItems={transportistas.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default TransportistasList;
