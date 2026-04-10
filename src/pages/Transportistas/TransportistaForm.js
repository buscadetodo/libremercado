import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import transportistasService from '../../services/transportistasService';
import diasService from '../../services/diasService';
import horariosService from '../../services/horariosService';
import '../Mayoristas/Mayoristas.css';
import '../Forms/Forms.css';

function TransportistaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id_usuario: 1, // Por defecto, debería venir del usuario logueado
    razon_social: '',
    cuit: '',
    hora_desde_id: '',
    hora_hasta_id: '',
    atencion_dia_desde_id: '',
    atencion_dia_hasta_id: '',
    tarifa_base: '',
    tarifa_km: '',
    radio_cobertura_km: '',
    descripcion: '',
  });

  useEffect(() => {
    loadDias();
    loadHorarios();
    
    if (isEdit) {
      loadTransportista();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDias = async () => {
    try {
      const response = await diasService.getAll();
      setDias(response.data || []);
    } catch (err) {
      console.error('Error al cargar días:', err);
    }
  };

  const loadHorarios = async () => {
    try {
      const response = await horariosService.getAll();
      setHorarios(response.data || []);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
    }
  };

  const loadTransportista = async () => {
    try {
      setLoading(true);
      const response = await transportistasService.getById(id);
      setFormData(response.data);
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
      
      if (isEdit) {
        await transportistasService.update(id, formData);
        toast.success('Transportista actualizado correctamente');
      } else {
        await transportistasService.create(formData);
        toast.success('Transportista creado correctamente');
      }

      navigate('/transportistas');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.detail || 
                         'Error al guardar el transportista';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading">⏳ Cargando...</div>;
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{isEdit ? '✏️ Editar Transportista' : '➕ Nuevo Transportista'}</h1>
        <button onClick={() => navigate('/transportistas')} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-section">
            <h3>Información General</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="razon_social">Razón Social *</label>
                <input
                  id="razon_social"
                  name="razon_social"
                  type="text"
                  value={formData.razon_social}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Transporte Logística SA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cuit">CUIT *</label>
                <input
                  id="cuit"
                  name="cuit"
                  type="text"
                  value={formData.cuit}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="20123456789"
                />
              </div>
            </div>

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
            <h3>Horarios de Atención</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hora_desde_id">Hora Desde *</label>
                <select
                  id="hora_desde_id"
                  name="hora_desde_id"
                  value={formData.hora_desde_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona hora</option>
                  {horarios && horarios.map((horario) => (
                    <option key={horario.id} value={horario.id}>
                      {horario.hora}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hora_hasta_id">Hora Hasta *</label>
                <select
                  id="hora_hasta_id"
                  name="hora_hasta_id"
                  value={formData.hora_hasta_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona hora</option>
                  {horarios && horarios.map((horario) => (
                    <option key={horario.id} value={horario.id}>
                      {horario.hora}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="atencion_dia_desde_id">Día Desde *</label>
                <select
                  id="atencion_dia_desde_id"
                  name="atencion_dia_desde_id"
                  value={formData.atencion_dia_desde_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona día</option>
                  {dias && dias.map((dia) => (
                    <option key={dia.id} value={dia.id}>
                      {dia.dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="atencion_dia_hasta_id">Día Hasta *</label>
                <select
                  id="atencion_dia_hasta_id"
                  name="atencion_dia_hasta_id"
                  value={formData.atencion_dia_hasta_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona día</option>
                  {dias && dias.map((dia) => (
                    <option key={dia.id} value={dia.id}>
                      {dia.dia}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Tarifas y Cobertura</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tarifa_base">Tarifa Base *</label>
                <input
                  id="tarifa_base"
                  name="tarifa_base"
                  type="number"
                  step="0.01"
                  value={formData.tarifa_base}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="5000.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tarifa_km">Tarifa por KM *</label>
                <input
                  id="tarifa_km"
                  name="tarifa_km"
                  type="number"
                  step="0.01"
                  value={formData.tarifa_km}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="150.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="radio_cobertura_km">Radio de Cobertura (KM) *</label>
              <input
                id="radio_cobertura_km"
                name="radio_cobertura_km"
                type="number"
                step="0.1"
                value={formData.radio_cobertura_km}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="50.0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/transportistas')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Guardando...' : isEdit ? '💾 Actualizar' : '✨ Crear Transportista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransportistaForm;
