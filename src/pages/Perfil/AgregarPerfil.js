import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import { usePerfilActivo } from '../../context/PerfilContext';
import useAuth from '../../hooks/useAuth';
import usuarioPerfilesService from '../../services/usuarioPerfilesService';
import usersService from '../../services/usersService';
import mayoristasService from '../../services/mayoristasService';
import minoristasService from '../../services/minoristasService';
import compradoresService from '../../services/compradoresService';
import transportistasService from '../../services/transportistasService';
import { PERFIL } from '../../config/roles';
import './AgregarPerfil.css';

function AgregarPerfil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { cargarPerfiles, tienePerfil } = usePerfilActivo();
  const [loading, setLoading] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');

  // Datos específicos según tipo
  const [datosEspecificos, setDatosEspecificos] = useState({
    // Mayorista/Minorista
    razon_social: '',
    cuit: '',
    rubro_id: '',
    pedido_minimo: '',
    retiro_en_local: 'n',
    descripcion: '',

    // Transportista
    tipo_vehiculo: '',
    patente: '',
    capacidad_carga: '',
    refrigerado: 'n',
    precio_base: '',
    precio_por_km: ''
  });

  const tiposDisponibles = [
    {
      tipo: 'mayorista',
      titulo: 'Mayorista',
      icono: '🏭',
      color: '#1565c0',
      descripcion: 'Vendo productos al por mayor',
      perfil_id: PERFIL.MAYORISTA,
      disabled: tienePerfil('mayorista')
    },
    {
      tipo: 'minorista',
      titulo: 'Minorista',
      icono: '🏪',
      color: '#7b1fa2',
      descripcion: 'Tengo un comercio y compro por mayor',
      perfil_id: PERFIL.MINORISTA,
      disabled: tienePerfil('minorista')
    },
    {
      tipo: 'comprador',
      titulo: 'Comprador',
      icono: '🛍️',
      color: '#0288d1',
      descripcion: 'Compro productos para consumo',
      perfil_id: PERFIL.COMPRADOR,
      disabled: tienePerfil('comprador')
    },
    {
      tipo: 'transportista',
      titulo: 'Transportista',
      icono: '🚚',
      color: '#e91e63',
      descripcion: 'Ofrezco servicios de flete',
      perfil_id: PERFIL.TRANSPORTISTA,
      disabled: tienePerfil('transportista')
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoSeleccionado) {
      toast.error('Por favor seleccioná un tipo de perfil');
      return;
    }

    setLoading(true);

    try {
      const tipoConfig = tiposDisponibles.find(t => t.tipo === tipoSeleccionado);

      // PASO 1: Asignar perfil
      await usuarioPerfilesService.assign(user.id, tipoConfig.perfil_id);
      toast.success('Perfil asignado exitosamente');

      // PASO 2: Crear registro específico
      await crearRegistroEspecifico(user.id);

      toast.success(`¡Perfil de ${tipoSeleccionado} agregado exitosamente!`);

      // Recargar perfiles
      await cargarPerfiles();

      // Redirigir al nuevo dashboard
      setTimeout(() => {
        const dashboardRoutes = {
          mayorista: '/mayorista/dashboard',
          minorista: '/minorista/dashboard',
          comprador: '/comprador/home',
          transportista: '/transportista/dashboard'
        };
        navigate(dashboardRoutes[tipoSeleccionado]);
      }, 1500);

    } catch (error) {
      console.error('Error al agregar perfil:', error);
      const mensaje = error.response?.data?.message || 'Error al agregar el perfil';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const crearRegistroEspecifico = async (idUsuario) => {
    const payload = {
      id_usuario: idUsuario,
      ...datosEspecificos
    };

    switch (tipoSeleccionado) {
      case 'mayorista':
        await mayoristasService.create({
          ...payload,
          pedido_minimo: parseFloat(datosEspecificos.pedido_minimo) || 0
        });
        break;
      case 'minorista':
        await minoristasService.create({
          ...payload,
          pedido_minimo: parseFloat(datosEspecificos.pedido_minimo) || 0
        });
        break;
      case 'comprador': {
        // El JWT no trae nombre/apellido: los obtenemos del usuario real
        const userResp = await usersService.getById(idUsuario);
        const datosUsuario = userResp?.data ?? userResp ?? {};
        await compradoresService.create({
          id_usuario: idUsuario,
          nombre: datosUsuario.nombre || '',
          apellido: datosUsuario.apellido || ''
        });
        break;
      }
      case 'transportista':
        await transportistasService.create({
          ...payload,
          precio_base: parseFloat(datosEspecificos.precio_base) || 0,
          precio_por_km: parseFloat(datosEspecificos.precio_por_km) || 0
        });
        break;
      default:
        break;
    }
  };

  const setCampo = (campo, valor) =>
    setDatosEspecificos((prev) => ({ ...prev, [campo]: valor }));

  const renderFormularioEspecifico = () => {
    if (!tipoSeleccionado) return null;

    const tituloConfig = tiposDisponibles.find(t => t.tipo === tipoSeleccionado);

    if (tipoSeleccionado === 'comprador') {
      return (
        <div className="ap-card">
          <div className="ap-info">
            <span>ℹ️</span>
            <span>
              El perfil de comprador se creará automáticamente con tu información
              actual. No necesitás cargar datos adicionales.
            </span>
          </div>
        </div>
      );
    }

    if (tipoSeleccionado === 'mayorista' || tipoSeleccionado === 'minorista') {
      return (
        <div className="ap-card">
          <h3 className="ap-form-title">Información de {tituloConfig?.titulo}</h3>
          <div className="ap-form-grid">
            <div className="ap-form-group full">
              <label>Razón Social *</label>
              <input
                type="text"
                value={datosEspecificos.razon_social}
                onChange={(e) => setCampo('razon_social', e.target.value)}
                placeholder="Ej: Distribuidora del Sur S.A."
                required
              />
            </div>

            <div className="ap-form-group">
              <label>CUIT *</label>
              <input
                type="text"
                value={datosEspecificos.cuit}
                onChange={(e) => setCampo('cuit', e.target.value)}
                placeholder="20-12345678-9"
                required
              />
            </div>

            <div className="ap-form-group">
              <label>Rubro</label>
              <select
                value={datosEspecificos.rubro_id}
                onChange={(e) => setCampo('rubro_id', e.target.value)}
              >
                <option value="">Seleccionar rubro...</option>
                <option value="1">Alimentos</option>
                <option value="2">Bebidas</option>
                <option value="3">Limpieza</option>
                <option value="4">Mascotas</option>
              </select>
            </div>

            <div className="ap-form-group">
              <label>Pedido Mínimo ($)</label>
              <input
                type="number"
                value={datosEspecificos.pedido_minimo}
                onChange={(e) => setCampo('pedido_minimo', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="ap-form-group">
              <label>&nbsp;</label>
              <label className="ap-check">
                <input
                  type="checkbox"
                  checked={datosEspecificos.retiro_en_local === 'y'}
                  onChange={(e) => setCampo('retiro_en_local', e.target.checked ? 'y' : 'n')}
                />
                Permitir retiro en local
              </label>
            </div>

            <div className="ap-form-group full">
              <label>Descripción</label>
              <textarea
                value={datosEspecificos.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
                rows="3"
                placeholder="Contanos sobre tu negocio..."
              />
            </div>
          </div>
        </div>
      );
    }

    if (tipoSeleccionado === 'transportista') {
      return (
        <div className="ap-card">
          <h3 className="ap-form-title">Información de transportista</h3>
          <div className="ap-form-grid">
            <div className="ap-form-group">
              <label>Tipo de Vehículo *</label>
              <select
                value={datosEspecificos.tipo_vehiculo}
                onChange={(e) => setCampo('tipo_vehiculo', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Camion">Camión</option>
                <option value="Furgon">Furgón</option>
                <option value="Semi">Semi</option>
              </select>
            </div>

            <div className="ap-form-group">
              <label>Patente *</label>
              <input
                type="text"
                value={datosEspecificos.patente}
                onChange={(e) => setCampo('patente', e.target.value)}
                placeholder="ABC123"
                required
              />
            </div>

            <div className="ap-form-group">
              <label>Capacidad de Carga</label>
              <input
                type="text"
                value={datosEspecificos.capacidad_carga}
                onChange={(e) => setCampo('capacidad_carga', e.target.value)}
                placeholder="Ej: 5000 kg"
              />
            </div>

            <div className="ap-form-group">
              <label>&nbsp;</label>
              <label className="ap-check">
                <input
                  type="checkbox"
                  checked={datosEspecificos.refrigerado === 'y'}
                  onChange={(e) => setCampo('refrigerado', e.target.checked ? 'y' : 'n')}
                />
                Vehículo refrigerado
              </label>
            </div>

            <div className="ap-form-group">
              <label>Precio Base ($)</label>
              <input
                type="number"
                value={datosEspecificos.precio_base}
                onChange={(e) => setCampo('precio_base', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="ap-form-group">
              <label>Precio por Km ($)</label>
              <input
                type="number"
                value={datosEspecificos.precio_por_km}
                onChange={(e) => setCampo('precio_por_km', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="agregar-perfil">
      <div className="ap-header">
        <h1>Agregar perfil</h1>
        <p>Elegí un tipo de cuenta para ampliar lo que podés hacer en LibreMercado.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paso 1: elegir tipo */}
        <div className="ap-card">
          <h2 className="ap-step-label">
            <span className="ap-step-num">1</span>
            ¿Qué perfil querés agregar?
          </h2>

          <div className="ap-tipos-grid">
            {tiposDisponibles.map((tipo) => (
              <div
                key={tipo.tipo}
                className={`ap-tipo-card ${tipoSeleccionado === tipo.tipo ? 'selected' : ''} ${tipo.disabled ? 'disabled' : ''}`}
                style={{ '--color': tipo.color }}
                onClick={() => !tipo.disabled && setTipoSeleccionado(tipo.tipo)}
                role="button"
                tabIndex={tipo.disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (!tipo.disabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setTipoSeleccionado(tipo.tipo);
                  }
                }}
              >
                {tipoSeleccionado === tipo.tipo && <span className="ap-tipo-check">✓</span>}
                <span className="ap-tipo-icono">{tipo.icono}</span>
                <h4 className="ap-tipo-titulo">{tipo.titulo}</h4>
                <p className="ap-tipo-desc">{tipo.descripcion}</p>
                {tipo.disabled && <span className="ap-badge-ya">✓ Ya lo tenés</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Paso 2: datos específicos */}
        {renderFormularioEspecifico()}

        {/* Acciones */}
        <div className="ap-actions">
          <button
            type="button"
            className="ap-btn-cancel"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="ap-btn-submit"
            disabled={loading || !tipoSeleccionado}
          >
            {loading ? 'Agregando perfil...' : 'Agregar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgregarPerfil;
