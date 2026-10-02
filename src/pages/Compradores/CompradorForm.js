import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import compradoresService from '../../services/compradoresService';
import SelectorUsuario from '../../components/SelectorUsuario/SelectorUsuario';
import Icon from '../../components/Icon/Icon';
import '../Mayoristas/Mayoristas.css';
import '../Forms/Forms.css';

function CompradorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Lo define SelectorUsuario: el usuario logueado, o el que elija el admin.
    id_usuario: '',
    nombre: '',
    apellido: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadComprador();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadComprador = async () => {
    try {
      setLoading(true);
      const response = await compradoresService.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Error al cargar datos del comprador');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      
      if (isEdit) {
        await compradoresService.update(id, formData);
        toast.success('Comprador actualizado correctamente');
      } else {
        await compradoresService.create(formData);
        toast.success('Comprador creado correctamente');
      }

      navigate('/compradores');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.detail || 
                         'Error al guardar el comprador';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading"><Icon name="loading" /> Cargando...</div>;
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{isEdit ? <><Icon name="edit" /> Editar Comprador</> : <><Icon name="add" /> Nuevo Comprador</>}</h1>
        <button onClick={() => navigate('/compradores')} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-message">
            <Icon name="error" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-section">
            <h3>Información del Comprador</h3>

            <SelectorUsuario
              value={formData.id_usuario}
              onChange={(idUsuario) =>
                setFormData((prev) => ({ ...prev, id_usuario: idUsuario }))
              }
              isEdit={isEdit}
            />

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Juan"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="info-box">
              <p>ℹ️ El comprador estará asociado al usuario actualmente logueado.</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/compradores')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><Icon name="loading" /> Guardando...</> : isEdit ? <><Icon name="save" /> Actualizar</> : <><Icon name="sparkles" /> Crear Comprador</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompradorForm;
