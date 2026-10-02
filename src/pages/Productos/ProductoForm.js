import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRubros, useMisComercios } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import productosService, { buildProductoPayload } from '../../services/productosService';
import mensajeDeError from '../../api/mensajeDeError';
import Icon from '../../components/Icon/Icon';
import '../Forms/Forms.css';
import './Productos.css';

/**
 * Traduce los errores propios del recurso Producto a algo entendible.
 * La API distingue dos casos que conviene no mostrar como "error genérico":
 *  403 → el comercio elegido no es del usuario del token
 *  404 → el comercio no existe
 * El resto (422 de validación incluido) lo resuelve el helper compartido.
 */
const mensajeDeErrorProducto = (err) => {
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 403) {
    return data?.error || 'No tenés permiso para publicar productos en ese comercio.';
  }
  if (status === 404) {
    return data?.error || 'El comercio seleccionado no existe.';
  }

  return mensajeDeError(err, 'Error al guardar el producto');
};

function ProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const { rubros, fetchRubros } = useRubros();
  const {
    opciones: comercios,
    loading: loadingComercios,
    isAdmin,
  } = useMisComercios();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // oferente_tipo + oferente_id se traducen a mayorista_id | minorista_id al enviar
    oferente_tipo: 'mayorista',
    oferente_id: '',
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    rubro_id: '',
    imagen_url: '',
  });

  useEffect(() => {
    fetchRubros();

    if (isEdit) {
      loadProducto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Si el usuario tiene un solo comercio, preseleccionarlo (caso más común).
  useEffect(() => {
    if (isEdit || formData.oferente_id || comercios.length !== 1) return;
    const unico = comercios[0];
    setFormData((prev) => ({
      ...prev,
      oferente_tipo: unico.tipo,
      oferente_id: String(unico.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comercios, isEdit]);

  const loadProducto = async () => {
    try {
      setLoading(true);
      const response = await productosService.getById(id);
      const p = response?.data ?? response;

      // La API guarda el oferente en una de las dos columnas: se deduce cuál.
      const esMayorista = p.mayorista_id != null;

      setFormData({
        oferente_tipo: esMayorista ? 'mayorista' : 'minorista',
        oferente_id: String(esMayorista ? p.mayorista_id : p.minorista_id ?? ''),
        sku: p.sku ?? '',
        nombre: p.nombre ?? '',
        descripcion: p.descripcion ?? '',
        precio: p.precio ?? '',
        stock: p.stock ?? '',
        rubro_id: p.rubro_id ?? '',
        imagen_url: p.imagen_url ?? '',
      });
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

  // El select de comercio codifica tipo e id juntos ("mayorista:3").
  const handleComercioChange = (e) => {
    const [tipo, comercioId] = e.target.value.split(':');
    setFormData({
      ...formData,
      oferente_tipo: tipo || 'mayorista',
      oferente_id: comercioId || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.oferente_id) {
      const msg = 'Seleccioná el comercio que ofrece el producto.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const payload = buildProductoPayload(formData);

      if (isEdit) {
        await productosService.update(id, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await productosService.create(payload);
        toast.success('Producto creado correctamente');
      }

      navigate('/productos');
    } catch (err) {
      const errorMessage = mensajeDeErrorProducto(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading"><Icon name="loading" /> Cargando...</div>;
  }

  const valorComercio = formData.oferente_id
    ? `${formData.oferente_tipo}:${formData.oferente_id}`
    : '';

  // Sin comercios no se puede crear nada: la API rechazaría el alta.
  const sinComercios = !loadingComercios && comercios.length === 0;

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{isEdit ? <><Icon name="edit" /> Editar Producto</> : <><Icon name="add" /> Nuevo Producto</>}</h1>
        <button onClick={() => navigate('/productos')} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="form-container">
        {error && <div className="error-message"><Icon name="error" /> {error}</div>}

        {sinComercios && (
          <div className="error-message">
            <Icon name="warning" /> Tu usuario no tiene una <strong>ficha comercial</strong> de mayorista ni
            de minorista. Ojo: tener el <em>perfil</em> de mayorista no es lo mismo que
            tener el comercio dado de alta (razón social, CUIT, rubro y horarios) — y la
            API pide el comercio para poder publicar productos.
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/agregar-perfil" className="btn btn-sm btn-secondary">
                Dar de alta mi comercio
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-section">
            <h3>Información Básica</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="oferente">Comercio *</label>
                <select
                  id="oferente"
                  name="oferente"
                  value={valorComercio}
                  onChange={handleComercioChange}
                  required
                  disabled={loadingComercios || sinComercios}
                  className="form-input"
                >
                  <option value="">
                    {loadingComercios ? 'Cargando comercios...' : 'Selecciona un comercio'}
                  </option>
                  {comercios.map((c) => (
                    <option key={`${c.tipo}:${c.id}`} value={`${c.tipo}:${c.id}`}>
                      {c.label} ({c.tipo === 'mayorista' ? 'Mayorista' : 'Minorista'})
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  {isAdmin
                    ? 'Como administrador podés publicar en cualquier comercio.'
                    : 'Solo aparecen los comercios asociados a tu usuario.'}
                </small>
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

            <div className="form-row">
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
                  placeholder="Aceite girasol 1.5L"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sku">SKU / Código *</label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="ACE-001"
                />
                <small className="form-hint">
                  Código interno del producto en tu comercio.
                </small>
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
                placeholder="Descripción detallada del producto..."
              />
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
                  placeholder="4500.00"
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
          </div>

          <div className="form-section">
            <h3>Imagen</h3>

            <div className="form-group">
              <label htmlFor="imagen_url">URL de la imagen</label>
              <input
                id="imagen_url"
                name="imagen_url"
                type="url"
                value={formData.imagen_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://..."
              />
              <small className="form-hint">
                Opcional. El recurso acepta una sola imagen por producto.
              </small>
            </div>

            {formData.imagen_url && (
              <div className="producto-imagen-preview">
                <img
                  src={formData.imagen_url}
                  alt="Vista previa del producto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || sinComercios}
              className="btn btn-primary"
            >
              {loading ? <><Icon name="loading" /> Guardando...</> : isEdit ? <><Icon name="save" /> Actualizar</> : <><Icon name="sparkles" /> Crear Producto</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoForm;
