import React, { useEffect, useState } from 'react';
import { useRubros } from '../../hooks';
import '../Mayoristas/Mayoristas.css';
import './Admin.css';

function RubrosList() {
  const { rubros, loading, error, fetchRubros, createRubro, deleteRubro } = useRubros();
  const [nuevoRubro, setNuevoRubro] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoRubro.trim()) {
      alert('Por favor ingresa un nombre para el rubro');
      return;
    }

    const result = await createRubro(nuevoRubro);
    if (result.success) {
      alert('✅ Rubro creado correctamente');
      setNuevoRubro('');
      setShowForm(false);
      fetchRubros();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rubro?')) {
      const result = await deleteRubro(id);
      if (result.success) {
        alert('✅ Rubro eliminado');
        fetchRubros();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    }
  };

  return (
    <div className="rubros-page">
      <div className="page-header">
        <div>
          <h1>📂 Rubros</h1>
          <p className="page-subtitle">Gestiona los rubros del sistema</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '❌ Cancelar' : '➕ Nuevo Rubro'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="inline-form">
              <input
                type="text"
                placeholder="Nombre del rubro (ej: Electrónica)"
                value={nuevoRubro}
                onChange={(e) => setNuevoRubro(e.target.value)}
                className="form-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                ✨ Crear Rubro
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading">⏳ Cargando rubros...</div>}
      {error && <div className="error-message">❌ {error}</div>}

      <div className="admin-list">
        {rubros && rubros.length > 0 ? (
          rubros.map((rubro) => (
            <div key={rubro.id} className="admin-item">
              <div className="admin-item-content">
                <span className="admin-item-icon">📂</span>
                <span className="admin-item-name">{rubro.rubro}</span>
                <span className="admin-item-id">ID: {rubro.id}</span>
              </div>
              <button onClick={() => handleDelete(rubro.id)} className="btn btn-danger btn-sm">
                🗑️ Eliminar
              </button>
            </div>
          ))
        ) : (
          !loading && <div className="empty-state">No hay rubros registrados</div>
        )}
      </div>
    </div>
  );
}

export default RubrosList;
