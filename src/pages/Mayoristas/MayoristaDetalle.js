import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { esAdmin } from '../../config/roles';
import mayoristasService from '../../services/mayoristasService';
import rubrosService from '../../services/rubrosService';
import horariosService from '../../services/horariosService';
import diasService from '../../services/diasService';
import './Mayoristas.css';

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

  if (loading) {
    return (
      <div className="mayoristas-page">
        <div className="loading">⏳ Cargando mayorista...</div>
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
          <h1>🏭 {mayorista.razon_social}</h1>
          <p className="page-subtitle">
            <span className="rubro-badge">{rubrosMap[mayorista.rubro_id] || 'Sin rubro'}</span>
          </p>
        </div>
        {isAdmin && (
          <Link to={`/mayoristas/${mayorista.id}/editar`} className="btn btn-primary">
            ✏️ Editar
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
              {mayorista.retiro_en_local === 'y' ? '✅ Sí' : '❌ No'}
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
            📞 Contactar
          </button>
        </div>
      </div>
    </div>
  );
}

export default MayoristaDetalle;
