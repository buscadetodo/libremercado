import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import authService from '../../services/authService';
import usuarioPerfilesService from '../../services/usuarioPerfilesService';
import mayoristasService from '../../services/mayoristasService';
import minoristasService from '../../services/minoristasService';
import compradoresService from '../../services/compradoresService';
import transportistasService from '../../services/transportistasService';
import './RegisterMejorado.css';

function RegisterMejorado() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [datosComunes, setDatosComunes] = useState({
    email: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellido: '',
    dni: ''
  });

  const [datosEspecificos, setDatosEspecificos] = useState({
    razon_social: '',
    cuit: '',
    rubro_id: '',
    pedido_minimo: '',
    retiro_en_local: 'n',
    descripcion: '',
    tipo_vehiculo: '',
    patente: '',
    capacidad_carga: '',
    refrigerado: 'n',
    precio_base: '',
    precio_por_km: ''
  });

  const getConfig = () => {
    const configs = {
      mayorista: {
        titulo: 'Registro de Mayorista',
        icono: '🏭',
        color: '#667eea',
        colorDark: '#5568d3',
        perfil_id: 1,
        totalSteps: 2
      },
      minorista: {
        titulo: 'Registro de Minorista',
        icono: '🏪',
        color: '#764ba2',
        colorDark: '#6a4391',
        perfil_id: 2,
        totalSteps: 2
      },
      comprador: {
        titulo: 'Registro de Comprador',
        icono: '🛍️',
        color: '#4facfe',
        colorDark: '#3d9ce3',
        perfil_id: 3,
        totalSteps: 1
      },
      transportista: {
        titulo: 'Registro de Transportista',
        icono: '🚚',
        color: '#f093fb',
        colorDark: '#d77fe0',
        perfil_id: 4,
        totalSteps: 2
      }
    };
    return configs[tipo] || configs.comprador;
  };

  const config = getConfig();

  // Validaciones
  const validateStep1 = () => {
    const newErrors = {};

    if (!datosComunes.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!datosComunes.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!datosComunes.dni.trim()) newErrors.dni = 'El DNI es requerido';
    if (datosComunes.dni.length < 7) newErrors.dni = 'DNI inválido';
    
    if (!datosComunes.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(datosComunes.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!datosComunes.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (datosComunes.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (datosComunes.password !== datosComunes.confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (tipo === 'mayorista' || tipo === 'minorista') {
      if (!datosEspecificos.razon_social.trim()) {
        newErrors.razon_social = 'La razón social es requerida';
      }
      if (!datosEspecificos.cuit.trim()) {
        newErrors.cuit = 'El CUIT es requerido';
      }
    }

    if (tipo === 'transportista') {
      if (!datosEspecificos.tipo_vehiculo) {
        newErrors.tipo_vehiculo = 'Selecciona el tipo de vehículo';
      }
      if (!datosEspecificos.patente.trim()) {
        newErrors.patente = 'La patente es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1 && config.totalSteps > 1) {
      handleNext();
      return;
    }

    if (currentStep === 2 && !validateStep2()) {
      return;
    }

    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    setLoading(true);

    try {
      // Crear usuario
      const usuarioPayload = {
        email: datosComunes.email,
        password: datosComunes.password,
        nombre: datosComunes.nombre,
        apellido: datosComunes.apellido,
        dni: datosComunes.dni,
        id_rol: 2,
        email_verificado: 'n',
        estado_cuenta: 'y'
      };

      const responseUser = await authService.register(usuarioPayload);
      const nuevoUsuarioId = responseUser.id || responseUser.data?.id;

      if (!nuevoUsuarioId) {
        throw new Error('No se pudo obtener el ID del usuario creado');
      }

      toast.success('✓ Usuario creado');

      // Login automático
      await authService.login(datosComunes.email, datosComunes.password);
      toast.success('✓ Autenticación exitosa');

      // Asignar perfil
      await usuarioPerfilesService.assign(nuevoUsuarioId, config.perfil_id);
      toast.success('✓ Perfil asignado');

      // Crear registro específico
      await crearRegistroEspecifico(nuevoUsuarioId);
      toast.success(`¡Cuenta de ${tipo} creada exitosamente!`);

      // Redirigir
      setTimeout(() => {
        const dashboardRoutes = {
          mayorista: '/mayorista/dashboard',
          minorista: '/minorista/dashboard',
          comprador: '/comprador/home',
          transportista: '/transportista/dashboard'
        };
        navigate(dashboardRoutes[tipo] || '/dashboard', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Error en registro:', error);
      const mensaje = error.response?.data?.message || error.message || 'Error al crear la cuenta';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const crearRegistroEspecifico = async (idUsuario) => {
    const payload = { id_usuario: idUsuario, ...datosEspecificos };

    switch (tipo) {
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
          nombre: datosComunes.nombre,
          apellido: datosComunes.apellido
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

  const getPasswordStrength = () => {
    const password = datosComunes.password;
    if (!password) return { strength: '', text: '' };
    
    if (password.length < 6) return { strength: 'weak', text: 'Débil' };
    if (password.length < 10) return { strength: 'medium', text: 'Media' };
    return { strength: 'strong', text: 'Fuerte' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-mejorado-container">
      <div 
        className="register-mejorado-card"
        style={{ 
          '--color': config.color,
          '--color-dark': config.colorDark
        }}
      >
        {/* Header */}
        <div className="register-header">
          <span className="register-header-icon">{config.icono}</span>
          <h1>{config.titulo}</h1>
          <p>Completá tus datos para empezar</p>
        </div>

        {/* Stepper */}
        {config.totalSteps > 1 && (
          <div className="stepper">
            <div className={`step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
              <div className="step-number">
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="step-label">Datos Personales</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
              <div className="step-number">
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="step-label">Información de {tipo}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="register-content">
            {/* PASO 1: Datos Personales */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <h2 className="form-step-title">Tus datos personales</h2>

              <div className="form-row-mejorado">
                <div className={`form-group-mejorado ${errors.nombre ? 'error' : ''}`}>
                  <label>Nombre *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="has-icon"
                      value={datosComunes.nombre}
                      onChange={(e) => {
                        setDatosComunes({...datosComunes, nombre: e.target.value});
                        setErrors({...errors, nombre: ''});
                      }}
                      placeholder="Juan"
                    />
                    <span className="input-icon">👤</span>
                  </div>
                  {errors.nombre && <span className="error-message">⚠️ {errors.nombre}</span>}
                </div>

                <div className={`form-group-mejorado ${errors.apellido ? 'error' : ''}`}>
                  <label>Apellido *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="has-icon"
                      value={datosComunes.apellido}
                      onChange={(e) => {
                        setDatosComunes({...datosComunes, apellido: e.target.value});
                        setErrors({...errors, apellido: ''});
                      }}
                      placeholder="Pérez"
                    />
                    <span className="input-icon">👤</span>
                  </div>
                  {errors.apellido && <span className="error-message">⚠️ {errors.apellido}</span>}
                </div>
              </div>

              <div className={`form-group-mejorado ${errors.dni ? 'error' : ''}`}>
                <label>DNI *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="has-icon"
                    value={datosComunes.dni}
                    onChange={(e) => {
                      setDatosComunes({...datosComunes, dni: e.target.value.replace(/\D/g, '')});
                      setErrors({...errors, dni: ''});
                    }}
                    placeholder="12345678"
                    maxLength="8"
                  />
                  <span className="input-icon">🆔</span>
                </div>
                {errors.dni && <span className="error-message">⚠️ {errors.dni}</span>}
              </div>

              <div className={`form-group-mejorado ${errors.email ? 'error' : ''}`}>
                <label>Email *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="has-icon"
                    value={datosComunes.email}
                    onChange={(e) => {
                      setDatosComunes({...datosComunes, email: e.target.value});
                      setErrors({...errors, email: ''});
                    }}
                    placeholder="tu@email.com"
                  />
                  <span className="input-icon">📧</span>
                </div>
                {errors.email && <span className="error-message">⚠️ {errors.email}</span>}
              </div>

              <div className="form-row-mejorado">
                <div className={`form-group-mejorado ${errors.password ? 'error' : ''}`}>
                  <label>Contraseña *</label>
                  <div className="input-wrapper password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="has-icon has-toggle"
                      value={datosComunes.password}
                      onChange={(e) => {
                        setDatosComunes({...datosComunes, password: e.target.value});
                        setErrors({...errors, password: ''});
                      }}
                      placeholder="••••••"
                    />
                    <span className="input-icon">🔒</span>
                    <button
                      type="button"
                      className={`password-toggle ${showPassword ? 'visible' : ''}`}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <span className="eye-icon">👁</span>
                    </button>
                  </div>
                  {errors.password && <span className="error-message">⚠️ {errors.password}</span>}
                  {datosComunes.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div className={`strength-fill ${passwordStrength.strength}`}></div>
                      </div>
                      <span className="strength-text">
                        Seguridad: {passwordStrength.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`form-group-mejorado ${errors.confirmarPassword ? 'error' : ''}`}>
                  <label>Confirmar Contraseña *</label>
                  <div className="input-wrapper password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="has-icon has-toggle"
                      value={datosComunes.confirmarPassword}
                      onChange={(e) => {
                        setDatosComunes({...datosComunes, confirmarPassword: e.target.value});
                        setErrors({...errors, confirmarPassword: ''});
                      }}
                      placeholder="••••••"
                    />
                    <span className="input-icon">🔒</span>
                    <button
                      type="button"
                      className={`password-toggle ${showConfirmPassword ? 'visible' : ''}`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <span className="eye-icon">👁</span>
                    </button>
                    {datosComunes.confirmarPassword && datosComunes.password === datosComunes.confirmarPassword && (
                      <span className="success-checkmark">✓</span>
                    )}
                  </div>
                  {errors.confirmarPassword && <span className="error-message">⚠️ {errors.confirmarPassword}</span>}
                </div>
              </div>

              {config.totalSteps === 1 && (
                <div className="step-navigation">
                  <button
                    type="button"
                    className="btn-nav btn-back"
                    onClick={() => navigate('/registro')}
                  >
                    ← Volver
                  </button>
                  <button type="submit" className="btn-nav btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span> Creando cuenta...
                      </>
                    ) : (
                      <>Crear cuenta →</>
                    )}
                  </button>
                </div>
              )}

              {config.totalSteps > 1 && (
                <div className="step-navigation">
                  <button
                    type="button"
                    className="btn-nav btn-back"
                    onClick={() => navigate('/registro')}
                  >
                    ← Volver
                  </button>
                  <button type="button" className="btn-nav btn-next" onClick={handleNext}>
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            {/* PASO 2: Datos Específicos */}
            {config.totalSteps > 1 && (
              <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                <h2 className="form-step-title">Información de tu {tipo}</h2>

                {(tipo === 'mayorista' || tipo === 'minorista') && (
                  <>
                    <div className={`form-group-mejorado ${errors.razon_social ? 'error' : ''}`}>
                      <label>Razón Social *</label>
                      <input
                        type="text"
                        value={datosEspecificos.razon_social}
                        onChange={(e) => {
                          setDatosEspecificos({...datosEspecificos, razon_social: e.target.value});
                          setErrors({...errors, razon_social: ''});
                        }}
                        placeholder="Mi Empresa S.A."
                      />
                      {errors.razon_social && <span className="error-message">⚠️ {errors.razon_social}</span>}
                    </div>

                    <div className={`form-group-mejorado ${errors.cuit ? 'error' : ''}`}>
                      <label>CUIT *</label>
                      <input
                        type="text"
                        value={datosEspecificos.cuit}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, cuit: e.target.value})}
                        placeholder="20-12345678-9"
                      />
                      {errors.cuit && <span className="error-message">⚠️ {errors.cuit}</span>}
                    </div>

                    <div className="form-group-mejorado">
                      <label>Rubro</label>
                      <select
                        value={datosEspecificos.rubro_id}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, rubro_id: e.target.value})}
                      >
                        <option value="">Seleccionar rubro...</option>
                        <option value="1">🍎 Alimentos</option>
                        <option value="2">🥤 Bebidas</option>
                        <option value="3">🧹 Limpieza</option>
                        <option value="4">🐾 Mascotas</option>
                      </select>
                    </div>

                    <div className="form-group-mejorado">
                      <label>Pedido Mínimo ($)</label>
                      <input
                        type="number"
                        value={datosEspecificos.pedido_minimo}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, pedido_minimo: e.target.value})}
                        placeholder="10000"
                      />
                    </div>

                    <div className="checkbox-mejorado">
                      <input
                        type="checkbox"
                        id="retiro"
                        checked={datosEspecificos.retiro_en_local === 'y'}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, retiro_en_local: e.target.checked ? 'y' : 'n'})}
                      />
                      <label htmlFor="retiro">
                        🏪 Permitir retiro en local
                      </label>
                    </div>

                    <div className="form-group-mejorado">
                      <label>Descripción</label>
                      <textarea
                        value={datosEspecificos.descripcion}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, descripcion: e.target.value})}
                        placeholder="Contanos sobre tu negocio..."
                        rows="4"
                      />
                    </div>
                  </>
                )}

                {tipo === 'transportista' && (
                  <>
                    <div className={`form-group-mejorado ${errors.tipo_vehiculo ? 'error' : ''}`}>
                      <label>Tipo de Vehículo *</label>
                      <select
                        value={datosEspecificos.tipo_vehiculo}
                        onChange={(e) => {
                          setDatosEspecificos({...datosEspecificos, tipo_vehiculo: e.target.value});
                          setErrors({...errors, tipo_vehiculo: ''});
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Camioneta">🚙 Camioneta</option>
                        <option value="Camion">🚛 Camión</option>
                        <option value="Furgon">🚐 Furgón</option>
                        <option value="Semi">🚚 Semi</option>
                      </select>
                      {errors.tipo_vehiculo && <span className="error-message">⚠️ {errors.tipo_vehiculo}</span>}
                    </div>

                    <div className={`form-group-mejorado ${errors.patente ? 'error' : ''}`}>
                      <label>Patente *</label>
                      <input
                        type="text"
                        value={datosEspecificos.patente}
                        onChange={(e) => {
                          setDatosEspecificos({...datosEspecificos, patente: e.target.value.toUpperCase()});
                          setErrors({...errors, patente: ''});
                        }}
                        placeholder="ABC123"
                        maxLength="7"
                      />
                      {errors.patente && <span className="error-message">⚠️ {errors.patente}</span>}
                    </div>

                    <div className="form-group-mejorado">
                      <label>Capacidad de Carga</label>
                      <input
                        type="text"
                        value={datosEspecificos.capacidad_carga}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, capacidad_carga: e.target.value})}
                        placeholder="Ej: 5000 kg"
                      />
                    </div>

                    <div className="checkbox-mejorado">
                      <input
                        type="checkbox"
                        id="refrigerado"
                        checked={datosEspecificos.refrigerado === 'y'}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, refrigerado: e.target.checked ? 'y' : 'n'})}
                      />
                      <label htmlFor="refrigerado">
                        ❄️ Vehículo refrigerado
                      </label>
                    </div>

                    <div className="form-row-mejorado">
                      <div className="form-group-mejorado">
                        <label>Precio Base ($)</label>
                        <input
                          type="number"
                          value={datosEspecificos.precio_base}
                          onChange={(e) => setDatosEspecificos({...datosEspecificos, precio_base: e.target.value})}
                          placeholder="500"
                        />
                      </div>

                      <div className="form-group-mejorado">
                        <label>Precio por Km ($)</label>
                        <input
                          type="number"
                          value={datosEspecificos.precio_por_km}
                          onChange={(e) => setDatosEspecificos({...datosEspecificos, precio_por_km: e.target.value})}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="form-group-mejorado">
                      <label>Descripción</label>
                      <textarea
                        value={datosEspecificos.descripcion}
                        onChange={(e) => setDatosEspecificos({...datosEspecificos, descripcion: e.target.value})}
                        placeholder="Contanos sobre tu servicio de transporte..."
                        rows="4"
                      />
                    </div>
                  </>
                )}

                <div className="step-navigation">
                  <button type="button" className="btn-nav btn-back" onClick={handleBack}>
                    ← Anterior
                  </button>
                  <button type="submit" className="btn-nav btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span> Creando cuenta...
                      </>
                    ) : (
                      <>Crear cuenta →</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterMejorado;
