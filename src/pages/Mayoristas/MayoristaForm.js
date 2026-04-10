import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRubros } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import mayoristasService from '../../services/mayoristasService';
import diasService from '../../services/diasService';
import horariosService from '../../services/horariosService';
import '../Mayoristas/Mayoristas.css';
import '../Forms/Forms.css';

function MayoristaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const { rubros, fetchRubros } = useRubros();
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id_usuario: 1, // Por defecto, debería venir del usuario logueado
    razon_social: '',
    cuit: '',
    rubro_id: '',
    hora_desde_id: '',
    hora_hasta_id: '',
    atencion_dia_desde_id: '',
    atencion_dia_hasta_id: '',
    pedido_minimo: '',
    retiro_en_local: 'y',
    descripcion: '',
  });

  useEffect(() => {
    fetchRubros();
    loadDias();
    loadHorarios();
    
    if (isEdit) {
      loadMayorista();
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

  const loadMayorista = async () => {
    try {
      setLoading(true);
      const response = await mayoristasService.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Error al cargar datos del mayorista');
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
        await mayoristasService.update(id, formData);
        toast.success('Mayorista actualizado correctamente');
      } else {
        await mayoristasService.create(formData);
        toast.success('Mayorista creado correctamente');
      }

      navigate('/mayoristas');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.detail || 
                         'Error al guardar el mayorista';
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
        <h1>{isEdit ? '✏️ Editar Mayorista' : '➕ Nuevo Mayorista'}</h1>
        <button onClick={() => navigate('/mayoristas')} className="btn btn-secondary">
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
                  placeholder="Distribuidora SA"
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
              <label htmlFor="rubro_id">Rubro *</label>
              <select
                id="rubro_id"
                name="rubro_id"
                value={formData.rubro_id}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Selecciona un rubro</option>
                {rubros && rubros.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.rubro}
                  </option>
                ))}
              </select>
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
                placeholder="Descripción del mayorista..."
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
            <h3>Condiciones Comerciales</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pedido_minimo">Pedido Mínimo *</label>
                <input
                  id="pedido_minimo"
                  name="pedido_minimo"
                  type="number"
                  step="0.01"
                  value={formData.pedido_minimo}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="1000.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="retiro_en_local">Retiro en Local *</label>
                <select
                  id="retiro_en_local"
                  name="retiro_en_local"
                  value={formData.retiro_en_local}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="y">✅ Sí</option>
                  <option value="n">❌ No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/mayoristas')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Guardando...' : isEdit ? '💾 Actualizar' : '✨ Crear Mayorista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MayoristaForm;
