import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { esAdmin } from '../../config/roles';
import mayoristasService from '../../services/mayoristasService';
import rubrosService from '../../services/rubrosService';
import horariosService from '../../services/horariosService';
import diasService from '../../services/diasService';
import productosService from '../../services/productosService';
import { FEATURE_PRODUCTOS } from '../../config/features';
import Icon from '../../components/Icon/Icon';
import './Mayoristas.css';
import '../Productos/Productos.css';

function MayoristaDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = esAdmin(user);

  const [mayorista, setMayorista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rubrosMap, setRubrosMap] = useState({});
  const [horariosMap, setHorariosMap] = useState({});
  const [diasMap, setDiasMap] = useState({});
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const [mResp, rResp, hResp, dResp] = await Promise.all([
          mayoristasService.getById(id),
          rubrosService.getAll(50, 0),
          horariosService.getAll(50, 0),
          diasService.getAll(10, 0),
        ]);

        const m = mResp?.data ?? mResp;
        if (!m || !m.id) {
          setError('No se encontró el mayorista solicitado.');
        } else {
          setMayorista(m);
        }

        const toMap = (resp, campo) => {
          const list = resp?.data ?? resp ?? [];
          const map = {};
          (Array.isArray(list) ? list : []).forEach((x) => {
            map[x.id] = x[campo];
          });
          return map;
        };
        setRubrosMap(toMap(rResp, 'rubro'));
        setHorariosMap(toMap(hResp, 'hora'));
        setDiasMap(toMap(dResp, 'dia'));
      } catch (err) {
        const msg =
          err.response?.status === 404
            ? 'No se encontró el mayorista solicitado.'
            : err.response?.data?.detail || 'Error al cargar el mayorista.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  // Catálogo del mayorista.
  // No existe GET /mayoristas/{id}/productos/: se usa el filtro del listado.
  useEffect(() => {
    const cargarProductos = async () => {
      if (!FEATURE_PRODUCTOS || !id) return;
      setLoadingProductos(true);
      try {
        const resp = await productosService.getByMayorista(id, { limit: 12 });
        const lista = resp?.data ?? resp ?? [];
        setProductos(Array.isArray(lista) ? lista : []);
      } catch (err) {
        // El catálogo es información complementaria: si falla, la ficha
        // del mayorista se sigue mostrando igual.
        console.error('Error al cargar productos del mayorista:', err);
        setProductos([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    cargarProductos();
  }, [id]);

  if (loading) {
    return (
      <div className="mayoristas-page">
        <div className="loading"><Icon name="loading" /> Cargando mayorista...</div>
      </div>
    );
  }

  if (error || !mayorista) {
    return (
      <div className="mayoristas-page">
        <Link to="/mayoristas" className="btn btn-secondary btn-sm">← Volver</Link>
        <div className="empty-state">{error || 'Mayorista no encontrado'}</div>
      </div>
    );
  }

  const horario =
    mayorista.hora_desde_id && mayorista.hora_hasta_id
      ? `${horariosMap[mayorista.hora_desde_id] ?? '—'} a ${horariosMap[mayorista.hora_hasta_id] ?? '—'}`
      : '—';
  const dias =
    mayorista.atencion_dia_desde_id && mayorista.atencion_dia_hasta_id
      ? `${diasMap[mayorista.atencion_dia_desde_id] ?? '—'} a ${diasMap[mayorista.atencion_dia_hasta_id] ?? '—'}`
      : '—';

  return (
    <div className="mayoristas-page">
      <div className="page-header">
        <div>
          <Link to="/mayoristas" className="btn btn-secondary btn-sm detalle-volver">
            ← Volver
          </Link>
          <h1><Icon name="mayorista" /> {mayorista.razon_social}</h1>
          <p className="page-subtitle">
            <span className="rubro-badge">{rubrosMap[mayorista.rubro_id] || 'Sin rubro'}</span>
          </p>
        </div>
        {isAdmin && (
          <Link to={`/mayoristas/${mayorista.id}/editar`} className="btn btn-primary">
            <Icon name="edit" /> Editar
          </Link>
        )}
      </div>

      <div className="detalle-card">
        <div className="detalle-grid">
          <div className="info-item">
            <span className="info-label">CUIT</span>
            <span className="info-value">{mayorista.cuit || '—'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Rubro</span>
            <span className="info-value">{rubrosMap[mayorista.rubro_id] || '—'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Pedido mínimo</span>
            <span className="info-value">
              ${Number(mayorista.pedido_minimo || 0).toLocaleString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Retiro en local</span>
            <span className="info-value">
              {mayorista.retiro_en_local === 'y' ? <><Icon name="success" /> Sí</> : <><Icon name="error" /> No</>}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Horario de atención</span>
            <span className="info-value">{horario}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Días de atención</span>
            <span className="info-value">{dias}</span>
          </div>
        </div>

        {mayorista.descripcion && (
          <div className="detalle-descripcion">
            <span className="info-label">Descripción</span>
            <p>{mayorista.descripcion}</p>
          </div>
        )}

        <div className="detalle-actions">
          <button
            className="btn btn-primary"
            onClick={() => alert('Funcionalidad de contacto pendiente')}
          >
            <Icon name="phone" /> Contactar
          </button>
        </div>
      </div>

      {/* Catálogo del mayorista (GET /productos/?mayorista_id=) */}
      {FEATURE_PRODUCTOS && (
        <div className="detalle-productos">
          <h2 className="section-heading"><Icon name="package" /> Productos</h2>

          {loadingProductos ? (
            <div className="loading"><Icon name="loading" /> Cargando productos...</div>
          ) : productos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="package" /></div>
              <h3>Sin productos publicados</h3>
              <p>Este mayorista todavía no cargó su catálogo.</p>
            </div>
          ) : (
            <div className="productos-grid">
              {productos.map((producto) => (
                <div key={producto.id} className="producto-card">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="producto-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="producto-image-placeholder"><Icon name="package" /></div>
                  )}
                  <div className="producto-content">
                    <h3 className="producto-nombre">{producto.nombre}</h3>
                    <div className="producto-meta">
                      {producto.sku && (
                        <span className="producto-sku">{producto.sku}</span>
                      )}
                      <span className="producto-rubro">
                        {rubrosMap[producto.rubro_id] || 'Sin rubro'}
                      </span>
                    </div>
                    <p className="producto-descripcion">
                      {producto.descripcion || 'Sin descripción'}
                    </p>
                    <div className="producto-precio">
                      <span className="precio-label">Precio:</span>
                      <span className="precio-valor">
                        ${Number(producto.precio || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="producto-stock">
                      <span
                        className={`stock-badge ${
                          producto.stock > 0 ? 'disponible' : 'agotado'
                        }`}
                      >
                        {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MayoristaDetalle;
