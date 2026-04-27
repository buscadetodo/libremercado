import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import { usePerfilActivo } from '../../context/PerfilContext';
import useAuth from '../../hooks/useAuth';
import usuarioPerfilesService from '../../services/usuarioPerfilesService';
import mayoristasService from '../../services/mayoristasService';
import minoristasService from '../../services/minoristasService';
import compradoresService from '../../services/compradoresService';
import transportistasService from '../../services/transportistasService';
import '../Auth/AuthMejorado.css';

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
      color: '#667eea',
      perfil_id: 1,
      disabled: tienePerfil('mayorista')
    },
    {
      tipo: 'minorista',
      titulo: 'Minorista',
      icono: '🏪',
      color: '#764ba2',
      perfil_id: 2,
      disabled: tienePerfil('minorista')
    },
    {
      tipo: 'comprador',
      titulo: 'Comprador',
      icono: '🛍️',
      color: '#4facfe',
      perfil_id: 3,
      disabled: tienePerfil('comprador')
    },
    {
      tipo: 'transportista',
      titulo: 'Transportista',
      icono: '🚚',
      color: '#f093fb',
      perfil_id: 4,
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
      case 'comprador':
        await compradoresService.create({
          id_usuario: idUsuario,
          nombre: user.nombre,
          apellido: user.apellido
        });
        break;
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

  const renderFormularioEspecifico = () => {
    if (!tipoSeleccionado) return null;

    if (tipoSeleccionado === 'comprador') {
      return (
        <div className="form-section">
          <p className="info-message">
            ℹ️ El perfil de comprador se creará con tu información actual.
          </p>
        </div>
      );
    }

    if (tipoSeleccionado === 'mayorista' || tipoSeleccionado === 'minorista') {
      return (
        <div className="form-section">
          <h3>Información de {tipoSeleccionado}</h3>
          
          <div className="form-group">
            <label>Razón Social *</label>
            <input
              type="text"
              value={datosEspecificos.razon_social}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, razon_social: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>CUIT *</label>
            <input
              type="text"
              value={datosEspecificos.cuit}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, cuit: e.target.value})}
              placeholder="20-12345678-9"
              required
            />
          </div>

          <div className="form-group">
            <label>Rubro</label>
            <select
              value={datosEspecificos.rubro_id}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, rubro_id: e.target.value})}
            >
              <option value="">Seleccionar rubro...</option>
              <option value="1">Alimentos</option>
              <option value="2">Bebidas</option>
              <option value="3">Limpieza</option>
              <option value="4">Mascotas</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pedido Mínimo ($)</label>
            <input
              type="number"
              value={datosEspecificos.pedido_minimo}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, pedido_minimo: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={datosEspecificos.retiro_en_local === 'y'}
                onChange={(e) => setDatosEspecificos({...datosEspecificos, retiro_en_local: e.target.checked ? 'y' : 'n'})}
              />
              Permitir retiro en local
            </label>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={datosEspecificos.descripcion}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, descripcion: e.target.value})}
              rows="3"
              placeholder="Contanos sobre tu negocio..."
            />
          </div>
        </div>
      );
    }

    if (tipoSeleccionado === 'transportista') {
      return (
        <div className="form-section">
          <h3>Información de transportista</h3>
          
          <div className="form-group">
            <label>Tipo de Vehículo *</label>
            <select
              value={datosEspecificos.tipo_vehiculo}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, tipo_vehiculo: e.target.value})}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Camioneta">Camioneta</option>
              <option value="Camion">Camión</option>
              <option value="Furgon">Furgón</option>
              <option value="Semi">Semi</option>
            </select>
          </div>

          <div className="form-group">
            <label>Patente *</label>
            <input
              type="text"
              value={datosEspecificos.patente}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, patente: e.target.value})}
              placeholder="ABC123"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacidad de Carga</label>
            <input
              type="text"
              value={datosEspecificos.capacidad_carga}
              onChange={(e) => setDatosEspecificos({...datosEspecificos, capacidad_carga: e.target.value})}
              placeholder="Ej: 5000 kg"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={datosEspecificos.refrigerado === 'y'}
                onChange={(e) => setDatosEspecificos({...datosEspecificos, refrigerado: e.target.checked ? 'y' : 'n'})}
              />
              Vehículo refrigerado
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio Base ($)</label>
              <input
                type="number"
                value={datosEspecificos.precio_base}
                onChange={(e) => setDatosEspecificos({...datosEspecificos, precio_base: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Precio por Km ($)</label>
              <input
                type="number"
                value={datosEspecificos.precio_por_km}
                onChange={(e) => setDatosEspecificos({...datosEspecificos, precio_por_km: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '700px' }}>
        <div className="auth-header">
          <h1>Agregar Nuevo Perfil</h1>
          <p>Expandí tus capacidades en LibreMercado</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-section">
            <h3>¿Qué perfil querés agregar?</h3>
            
            <div className="tipos-perfil-grid">
              {tiposDisponibles.map((tipo) => (
                <div
                  key={tipo.tipo}
                  className={`tipo-perfil-card ${
                    tipoSeleccionado === tipo.tipo ? 'selected' : ''
                  } ${tipo.disabled ? 'disabled' : ''}`}
                  style={{ '--color': tipo.color }}
                  onClick={() => !tipo.disabled && setTipoSeleccionado(tipo.tipo)}
                >
                  <div className="tipo-perfil-icono">{tipo.icono}</div>
                  <h4>{tipo.titulo}</h4>
                  {tipo.disabled && (
                    <span className="badge-ya-tenes">✓ Ya lo tenés</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderFormularioEspecifico()}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !tipoSeleccionado}
            >
              {loading ? 'Agregando perfil...' : 'Agregar perfil'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .tipos-perfil-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .tipo-perfil-card {
          padding: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .tipo-perfil-card:hover:not(.disabled) {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--color);
        }

        .tipo-perfil-card.selected {
          border-color: var(--color);
          background: linear-gradient(135deg, var(--color)10, transparent);
        }

        .tipo-perfil-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tipo-perfil-icono {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .badge-ya-tenes {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: #48bb78;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: white;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .info-message {
          padding: 16px;
          background: #edf2f7;
          border-radius: 8px;
          color: #4a5568;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default AgregarPerfil;
