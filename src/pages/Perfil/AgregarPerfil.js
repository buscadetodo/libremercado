import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import { usePerfilActivo } from '../../context/PerfilContext';
import useAuth from '../../hooks/useAuth';
import { useMisComercios } from '../../hooks';
import SelectRubro from '../../components/SelectRubro/SelectRubro';
import usuarioPerfilesService from '../../services/usuarioPerfilesService';
import usersService from '../../services/usersService';
import mayoristasService from '../../services/mayoristasService';
import minoristasService from '../../services/minoristasService';
import compradoresService from '../../services/compradoresService';
import transportistasService from '../../services/transportistasService';
import diasService from '../../services/diasService';
import horariosService from '../../services/horariosService';
import { PERFIL } from '../../config/roles';
import Icon from '../../components/Icon/Icon';
import { esPatenteValida, normalizarPatente, PATENTE_AYUDA, PATENTE_MAX } from '../../utils/validaciones';
import './AgregarPerfil.css';

/**
 * Extrae un mensaje legible de un error de la API.
 * FastAPI devuelve `detail` (string o array de errores de validación), no `message`.
 */
const mensajeDeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const primero = data.detail[0];
    const campo = Array.isArray(primero.loc) ? primero.loc[primero.loc.length - 1] : null;
    const msg = primero.msg?.replace(/^Value error,\s*/, '') || 'dato inválido';
    return campo ? `${campo}: ${msg}` : msg;
  }

  return data.error || data.detail || data.message || fallback;
};

function AgregarPerfil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { cargarPerfiles, tienePerfil, tiposSinFicha } = usePerfilActivo();
  const { reload: recargarComercios } = useMisComercios();
  const [loading, setLoading] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');

  /**
   * Perfil asignado pero sin su ficha: hay que poder reintentar.
   * Vale para los cuatro tipos, no solo para mayorista y minorista: si falla el
   * POST de transportista o comprador, el perfil igual queda asignado y la card
   * no puede darse por completa, o el usuario se queda sin forma de cargarla.
   */
  const altaIncompleta = (tipo) => tiposSinFicha.includes(tipo);

  /** El alta está realmente completa: perfil asignado + ficha creada. */
  const altaCompleta = (tipo) => tienePerfil(tipo) && !altaIncompleta(tipo);

  // Catálogos de la API (días 1–7, horarios 1–24)
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);

  // Datos específicos según tipo
  const [datosEspecificos, setDatosEspecificos] = useState({
    // Mayorista/Minorista
    razon_social: '',
    cuit: '',
    rubro_id: '',
    // La API exige estos 4 FKs para dar de alta el comercio.
    hora_desde_id: '',
    hora_hasta_id: '',
    atencion_dia_desde_id: '',
    atencion_dia_hasta_id: '',
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

  // Catálogos + valores por defecto razonables (Lunes a Viernes, 08:00 a 18:00).
  useEffect(() => {
    const cargarCatalogos = async () => {
      // Los rubros los carga SelectRubro por su cuenta.
      try {
        const [diasResp, horariosResp] = await Promise.all([
          diasService.getAll(),
          horariosService.getAll(50, 0),
        ]);

        const listaDias = diasResp?.data ?? diasResp ?? [];
        const listaHorarios = horariosResp?.data ?? horariosResp ?? [];
        setDias(Array.isArray(listaDias) ? listaDias : []);
        setHorarios(Array.isArray(listaHorarios) ? listaHorarios : []);

        // Se buscan por valor, no por id, para no depender del orden del seed.
        const buscarHora = (hhmm) =>
          (Array.isArray(listaHorarios) ? listaHorarios : []).find((h) =>
            String(h.hora).startsWith(hhmm)
          )?.id ?? '';
        const buscarDia = (nombre) =>
          (Array.isArray(listaDias) ? listaDias : []).find(
            (d) => String(d.dia).toLowerCase() === nombre
          )?.id ?? '';

        setDatosEspecificos((prev) => ({
          ...prev,
          hora_desde_id: prev.hora_desde_id || buscarHora('08'),
          hora_hasta_id: prev.hora_hasta_id || buscarHora('18'),
          atencion_dia_desde_id: prev.atencion_dia_desde_id || buscarDia('lunes'),
          atencion_dia_hasta_id: prev.atencion_dia_hasta_id || buscarDia('viernes'),
        }));
      } catch (err) {
        console.error('Error al cargar días/horarios:', err);
      }
    };

    cargarCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiposDisponibles = [
    {
      tipo: 'mayorista',
      titulo: 'Mayorista',
      icono: 'mayorista',
      color: '#1565c0',
      descripcion: 'Vendo productos al por mayor',
      perfil_id: PERFIL.MAYORISTA,
      disabled: altaCompleta('mayorista'),
      incompleto: altaIncompleta('mayorista')
    },
    {
      tipo: 'minorista',
      titulo: 'Minorista',
      icono: 'minorista',
      color: '#7b1fa2',
      descripcion: 'Tengo un comercio y compro por mayor',
      perfil_id: PERFIL.MINORISTA,
      disabled: altaCompleta('minorista'),
      incompleto: altaIncompleta('minorista')
    },
    {
      tipo: 'comprador',
      titulo: 'Comprador',
      icono: 'comprador',
      color: '#0288d1',
      descripcion: 'Compro productos para consumo',
      perfil_id: PERFIL.COMPRADOR,
      disabled: altaCompleta('comprador'),
      incompleto: altaIncompleta('comprador')
    },
    {
      tipo: 'transportista',
      titulo: 'Transportista',
      icono: 'transportista',
      color: '#e91e63',
      descripcion: 'Ofrezco servicios de flete',
      perfil_id: PERFIL.TRANSPORTISTA,
      disabled: altaCompleta('transportista'),
      incompleto: altaIncompleta('transportista')
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoSeleccionado) {
      toast.error('Por favor seleccioná un tipo de perfil');
      return;
    }

    if (tipoSeleccionado === 'transportista' && !esPatenteValida(datosEspecificos.patente)) {
      toast.error(`Patente inválida (${PATENTE_AYUDA})`);
      return;
    }

    setLoading(true);

    try {
      const tipoConfig = tiposDisponibles.find(t => t.tipo === tipoSeleccionado);

      // PASO 1: asignar el perfil (tabla usuario_perfiles).
      // Sin toast de éxito acá: el alta recién está completa cuando también
      // existe el registro del paso 2. Avisar antes daba un falso positivo
      // (el perfil quedaba asignado pero sin comercio, y el usuario creía
      // que había terminado).
      //
      // Si el perfil ya estaba asignado se saltea: es el caso de un alta que
      // quedó a medio camino y se está reintentando, y reasignarlo rompería
      // por clave duplicada.
      if (!tienePerfil(tipoSeleccionado)) {
        await usuarioPerfilesService.assign(user.id, tipoConfig.perfil_id);
      }

      // PASO 2: crear el registro específico (mayorista / minorista / etc.)
      try {
        await crearRegistroEspecifico(user.id);
      } catch (errorRegistro) {
        console.error('Error al crear el registro específico:', errorRegistro);
        // El perfil sí quedó asignado: hay que decirlo, porque el estado
        // intermedio es justamente el que confunde.
        const detalle = mensajeDeError(errorRegistro, 'la API rechazó los datos');
        toast.error(
          `El perfil de ${tipoSeleccionado} se asignó, pero no se pudo crear el registro: ${detalle}. Revisá los datos y volvé a intentar.`
        );
        await cargarPerfiles();
        await recargarComercios();
        return;
      }

      toast.success(`¡Perfil de ${tipoSeleccionado} agregado exitosamente!`);

      // Recargar perfiles y comercios
      await cargarPerfiles();
      await recargarComercios();

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
      toast.error(mensajeDeError(error, 'Error al agregar el perfil'));
    } finally {
      setLoading(false);
    }
  };

  const crearRegistroEspecifico = async (idUsuario) => {
    switch (tipoSeleccionado) {
      // Mayorista y minorista comparten exactamente la misma estructura.
      // Se arma campo por campo: hacer spread de `datosEspecificos` filtraba
      // campos de transportista (patente, tipo_vehiculo…) que la API rechaza.
      case 'mayorista':
      case 'minorista': {
        const comercio = {
          id_usuario: Number(idUsuario),
          razon_social: datosEspecificos.razon_social.trim(),
          cuit: datosEspecificos.cuit.trim(),
          rubro_id: Number(datosEspecificos.rubro_id),
          hora_desde_id: Number(datosEspecificos.hora_desde_id),
          hora_hasta_id: Number(datosEspecificos.hora_hasta_id),
          atencion_dia_desde_id: Number(datosEspecificos.atencion_dia_desde_id),
          atencion_dia_hasta_id: Number(datosEspecificos.atencion_dia_hasta_id),
          pedido_minimo: parseFloat(datosEspecificos.pedido_minimo) || 0,
          retiro_en_local: datosEspecificos.retiro_en_local,
          descripcion: datosEspecificos.descripcion.trim() || null,
        };

        if (tipoSeleccionado === 'mayorista') {
          await mayoristasService.create(comercio);
        } else {
          await minoristasService.create(comercio);
        }
        break;
      }
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
          id_usuario: Number(idUsuario),
          tipo_vehiculo: datosEspecificos.tipo_vehiculo,
          patente: datosEspecificos.patente.trim(),
          capacidad_carga: datosEspecificos.capacidad_carga.trim(),
          refrigerado: datosEspecificos.refrigerado,
          precio_base: parseFloat(datosEspecificos.precio_base) || 0,
          precio_por_km: parseFloat(datosEspecificos.precio_por_km) || 0,
          descripcion: datosEspecificos.descripcion.trim() || null,
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
              <label>Rubro *</label>
              <SelectRubro
                value={datosEspecificos.rubro_id}
                onChange={(e) => setCampo('rubro_id', e.target.value)}
                required
              />
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
              <label>Atiende desde (hora) *</label>
              <select
                value={datosEspecificos.hora_desde_id}
                onChange={(e) => setCampo('hora_desde_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {horarios.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hora}
                  </option>
                ))}
              </select>
            </div>

            <div className="ap-form-group">
              <label>Atiende hasta (hora) *</label>
              <select
                value={datosEspecificos.hora_hasta_id}
                onChange={(e) => setCampo('hora_hasta_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {horarios.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hora}
                  </option>
                ))}
              </select>
            </div>

            <div className="ap-form-group">
              <label>Atiende desde (día) *</label>
              <select
                value={datosEspecificos.atencion_dia_desde_id}
                onChange={(e) => setCampo('atencion_dia_desde_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {dias.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dia}
                  </option>
                ))}
              </select>
            </div>

            <div className="ap-form-group">
              <label>Atiende hasta (día) *</label>
              <select
                value={datosEspecificos.atencion_dia_hasta_id}
                onChange={(e) => setCampo('atencion_dia_hasta_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {dias.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dia}
                  </option>
                ))}
              </select>
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
                {/* Mismos valores que TransportistaForm: si acá se guarda
                    "Camion" y allá "Camión", el mismo vehículo queda con dos
                    grafías distintas en la base. */}
                <option value="">Seleccionar...</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Camión">Camión</option>
                <option value="Furgón">Furgón</option>
                <option value="Semi">Semi</option>
              </select>
            </div>

            <div className="ap-form-group">
              <label htmlFor="ap-patente">Patente *</label>
              <input
                id="ap-patente"
                type="text"
                value={datosEspecificos.patente}
                onChange={(e) => setCampo('patente', normalizarPatente(e.target.value))}
                placeholder="ABC123"
                maxLength={PATENTE_MAX}
                aria-describedby="ap-patente-ayuda"
                required
              />
              <small id="ap-patente-ayuda" className="ap-ayuda">{PATENTE_AYUDA}</small>
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
        <p>Elegí un tipo de cuenta para ampliar lo que podés hacer en BuscaDeTodoOnline.</p>
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
                <span className="ap-tipo-icono"><Icon name={tipo.icono} /></span>
                <h4 className="ap-tipo-titulo">{tipo.titulo}</h4>
                <p className="ap-tipo-desc">{tipo.descripcion}</p>
                {tipo.disabled && <span className="ap-badge-ya">✓ Ya lo tenés</span>}
                {tipo.incompleto && (
                  <span className="ap-badge-incompleto">
                    <Icon name="warning" /> Falta cargar el comercio
                  </span>
                )}
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
