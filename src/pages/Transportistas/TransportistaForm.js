import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import transportistasService from '../../services/transportistasService';
import SelectorUsuario from '../../components/SelectorUsuario/SelectorUsuario';
import mensajeDeError from '../../api/mensajeDeError';
import Icon from '../../components/Icon/Icon';
import '../Mayoristas/Mayoristas.css';
import '../Forms/Forms.css';

/**
 * Contrato del recurso Transportista (colección del backend):
 *   { id, id_usuario, tipo_vehiculo, patente, capacidad_carga, refrigerado,
 *     precio_base, precio_por_km, descripcion, modificado, creado }
 *
 * A diferencia de mayorista/minorista, el transportista NO tiene razón social,
 * CUIT, rubro ni horarios/días de atención.
 */

// Mismos valores que usa la pantalla de alta de perfil, para no terminar con
// dos grafías distintas del mismo vehículo en la base.
const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi'];

function TransportistaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Lo define SelectorUsuario: el usuario logueado, o el que elija el admin.
    id_usuario: '',
    tipo_vehiculo: '',
    patente: '',
    capacidad_carga: '',
    refrigerado: 'n',
    precio_base: '',
    precio_por_km: '',
    descripcion: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadTransportista();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTransportista = async () => {
    try {
      setLoading(true);
      const response = await transportistasService.getById(id);
      const t = response?.data ?? response ?? {};

      setFormData({
        id_usuario: t.id_usuario ?? '',
        tipo_vehiculo: t.tipo_vehiculo ?? '',
        patente: t.patente ?? '',
        capacidad_carga: t.capacidad_carga ?? '',
        refrigerado: t.refrigerado ?? 'n',
        precio_base: t.precio_base ?? '',
        precio_por_km: t.precio_por_km ?? '',
        descripcion: t.descripcion ?? '',
      });
    } catch (err) {
      setError('Error al cargar datos del transportista');
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

      const payload = {
        id_usuario: Number(formData.id_usuario),
        tipo_vehiculo: formData.tipo_vehiculo,
        patente: formData.patente.trim(),
        capacidad_carga: formData.capacidad_carga.trim(),
        refrigerado: formData.refrigerado,
        precio_base: parseFloat(formData.precio_base) || 0,
        precio_por_km: parseFloat(formData.precio_por_km) || 0,
        descripcion: formData.descripcion.trim() || null,
      };

      if (isEdit) {
        await transportistasService.update(id, payload);
        toast.success('Transportista actualizado correctamente');
      } else {
        await transportistasService.create(payload);
        toast.success('Transportista creado correctamente');
      }

      navigate('/transportistas');
    } catch (err) {
      const errorMessage = mensajeDeError(err, 'Error al guardar el transportista');
      setError(errorMessage);
      toast.error(errorMessage);
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
        <h1>{isEdit ? <><Icon name="edit" /> Editar Transportista</> : <><Icon name="add" /> Nuevo Transportista</>}</h1>
        <button onClick={() => navigate('/transportistas')} className="btn btn-secondary">
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
            <h3>Información General</h3>

            <SelectorUsuario
              value={formData.id_usuario}
              onChange={(idUsuario) =>
                setFormData((prev) => ({ ...prev, id_usuario: idUsuario }))
              }
              isEdit={isEdit}
            />

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="Descripción del servicio de transporte..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Vehículo</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo_vehiculo">Tipo de Vehículo *</label>
                <select
                  id="tipo_vehiculo"
                  name="tipo_vehiculo"
                  value={formData.tipo_vehiculo}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona un tipo</option>
                  {TIPOS_VEHICULO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="patente">Patente *</label>
                <input
                  id="patente"
                  name="patente"
                  type="text"
                  value={formData.patente}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="ABC123"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacidad_carga">Capacidad de Carga *</label>
                <input
                  id="capacidad_carga"
                  name="capacidad_carga"
                  type="text"
                  value={formData.capacidad_carga}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="5000 kg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="refrigerado">¿Refrigerado? *</label>
                <select
                  id="refrigerado"
                  name="refrigerado"
                  value={formData.refrigerado}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="n">No</option>
                  <option value="y">Sí</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Tarifas</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="precio_base">Precio Base *</label>
                <input
                  id="precio_base"
                  name="precio_base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_base}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="200.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio_por_km">Precio por KM *</label>
                <input
                  id="precio_por_km"
                  name="precio_por_km"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_por_km}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="15.00"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/transportistas')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><Icon name="loading" /> Guardando...</> : isEdit ? <><Icon name="save" /> Actualizar</> : <><Icon name="sparkles" /> Crear Transportista</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransportistaForm;
