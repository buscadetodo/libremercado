import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import compradoresService from '../../services/compradoresService';
import { useAuth } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import { esAdmin } from '../../config/roles';
import Pagination from '../../components/Pagination/Pagination';
import Icon from '../../components/Icon/Icon';
import '../Mayoristas/Mayoristas.css';

function CompradoresList() {
  const [compradores, setCompradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = esAdmin(user);
  const toast = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchCompradores();
  }, []);

  const fetchCompradores = async () => {
    try {
      setLoading(true);
      const response = await compradoresService.getAll();
      setCompradores(response.data || []);
    } catch (err) {
      setError('Error al cargar compradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este comprador?')) {
      try {
        await compradoresService.delete(id);
        toast.success('Comprador eliminado correctamente');
        fetchCompradores();
      } catch (err) {
        toast.error('Error al eliminar comprador');
      }
    }
  };

  return (
    <div className="compradores-page">
      <div className="page-header">
        <div>
          <h1><Icon name="comprador" /> Compradores</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Gestiona los compradores registrados' : 'Explorá los compradores registrados'}
          </p>
        </div>
        {isAdmin && (
          <Link to="/compradores/nuevo" className="btn btn-primary">
            <Icon name="add" /> Nuevo Comprador
          </Link>
        )}
      </div>

      {loading && <div className="loading"><Icon name="loading" /> Cargando compradores...</div>}
      {error && <div className="error-message"><Icon name="error" /> {error}</div>}

      <div className="compradores-grid">
        {compradores && compradores.length > 0 ? (
          compradores
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((comprador) => (
            <div key={comprador.id} className="comprador-card">
              <div className="comprador-header">
                <h3>{comprador.nombre} {comprador.apellido}</h3>
              </div>

              <div className="comprador-info">
                <div className="info-item">
                  <span className="info-label">ID Usuario:</span>
                  <span className="info-value">{comprador.id_usuario}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">#{comprador.id}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="comprador-actions">
                  <Link to={`/compradores/${comprador.id}/editar`} className="btn btn-primary btn-sm">
                    <Icon name="edit" /> Editar
                  </Link>
                  <button onClick={() => handleDelete(comprador.id)} className="btn btn-danger btn-sm">
                    <Icon name="delete" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay compradores registrados</div>
        )}
      </div>

      {/* Paginación */}
      {compradores && compradores.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(compradores.length / itemsPerPage)}
          totalItems={compradores.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default CompradoresList;
