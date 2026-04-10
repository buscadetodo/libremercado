import React, { useEffect } from 'react';
import { useUsers } from '../../hooks';
import '../Mayoristas/Mayoristas.css';
import './Admin.css';

function UsuariosList() {
  const { users, loading, error, fetchUsers, deleteUser } = useUsers();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      const result = await deleteUser(id);
      if (result.success) {
        alert('✅ Usuario eliminado');
        fetchUsers();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    }
  };

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1>👥 Usuarios</h1>
          <p className="page-subtitle">Gestiona los usuarios del sistema</p>
        </div>
      </div>

      {loading && <div className="loading">⏳ Cargando usuarios...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      <div className="users-grid">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {getInitials(user.nombre, user.apellido)}
                </div>
                <div className="user-header-info">
                  <h3>{user.nombre} {user.apellido}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="user-info">
                <div className="info-item">
                  <span className="info-label">DNI:</span>
                  <span className="info-value">{user.dni}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className={`status-badge ${user.estado_cuenta === 'y' ? 'status-active' : 'status-inactive'}`}>
                    {user.estado_cuenta === 'y' ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Verificado:</span>
                  <span className="info-value">{user.email_verificado === 'y' ? '✅' : '❌'}</span>
                </div>
              </div>

              <div className="user-actions">
                <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay usuarios registrados</div>
        )}
      </div>
    </div>
  );
}

export default UsuariosList;
