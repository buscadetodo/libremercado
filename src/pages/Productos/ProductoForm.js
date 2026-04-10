import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRubros } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import productosService from '../../services/productosService';
import mayoristasService from '../../services/mayoristasService';
import '../Forms/Forms.css';
import './Productos.css';

function ProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const { rubros, fetchRubros } = useRubros();
  const [mayoristas, setMayoristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    mayorista_id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    rubro_id: '',
    unidad_medida: 'unidad',
  });

  useEffect(() => {
    fetchRubros();
    loadMayoristas();
    
    if (isEdit) {
      loadProducto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMayoristas = async () => {
    try {
      const response = await mayoristasService.getAll({ limit: 100 });
      setMayoristas(response.data || []);
    } catch (err) {
      console.error('Error al cargar mayoristas:', err);
    }
  };

  const loadProducto = async () => {
    try {
      setLoading(true);
      const response = await productosService.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Error al cargar datos del producto');
      toast.error('Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (isEdit) {
        await productosService.update(id, formData);
        toast.success('Producto actualizado correctamente');
      } else {
        await productosService.create(formData);
        toast.success('Producto creado correctamente');
      }

      navigate('/productos');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Error al guardar el producto';
      setError(errorMessage);
      toast.error(errorMessage);
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
        <h1>{isEdit ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h1>
        <button onClick={() => navigate('/productos')} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="form-container">
        {error && <div className="error-message">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-section">
            <h3>Información Básica</h3>

            <div className="form-group">
              <label htmlFor="nombre">Nombre del Producto *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Arroz Integral 1kg"
              />
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
                placeholder="Descripción detallada del producto..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mayorista_id">Mayorista *</label>
                <select
                  id="mayorista_id"
                  name="mayorista_id"
                  value={formData.mayorista_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona un mayorista</option>
                  {mayoristas &&
                    mayoristas.map((mayorista) => (
                      <option key={mayorista.id} value={mayorista.id}>
                        {mayorista.razon_social}
                      </option>
                    ))}
                </select>
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
                  {rubros &&
                    rubros.map((rubro) => (
                      <option key={rubro.id} value={rubro.id}>
                        {rubro.rubro}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Precio y Stock</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="precio">Precio *</label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="1500.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Disponible *</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="unidad_medida">Unidad de Medida *</label>
              <select
                id="unidad_medida"
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
                className="form-input"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="gr">Gramo (gr)</option>
                <option value="lt">Litro (lt)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="caja">Caja</option>
                <option value="paquete">Paquete</option>
                <option value="bolsa">Bolsa</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Guardando...' : isEdit ? '💾 Actualizar' : '✨ Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoForm;
