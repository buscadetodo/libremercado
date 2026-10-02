import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import Icon from '../../components/Icon/Icon';
import { esEmailValido } from '../../utils/validaciones';
import { useAuth } from '../../hooks';
import authService from '../../services/authService';
import './AuthMejorado.css';
import './RegisterMejorado.css';

function RegisterUniversal() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
    setRegisterError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (formData.dni.length < 7 || formData.dni.length > 8) {
      newErrors.dni = 'DNI inválido (7-8 dígitos)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!esEmailValido(formData.email)) {
      newErrors.email = 'Ingresá un email válido (ej.: nombre@empresa.com)';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmá la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: '', text: '' };
    
    if (password.length < 6) return { strength: 'weak', text: 'Débil' };
    if (password.length < 10) return { strength: 'medium', text: 'Media' };
    return { strength: 'strong', text: 'Fuerte' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para la API
      const userData = {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        id_rol: 2, // Rol por defecto: usuario
        email_verificado: 'n',
        estado_cuenta: 'y'
      };

      await authService.register(userData);

      toast.success('¡Cuenta creada exitosamente!');

      // Login automático (vía contexto, para que la sesión quede sincronizada)
      await login(formData.email, formData.password);

      toast.success('¡Bienvenido a BuscaDeTodoOnline!');

      // Onboarding: elegir y asignar el tipo de perfil
      setTimeout(() => {
        navigate('/agregar-perfil', { replace: true });
      }, 1000);

    } catch (error) {
      console.error('Error en registro:', error);
      const mensaje = error.response?.data?.message || 
                     error.response?.data?.detail || 
                     error.message ||
                     'Error al crear la cuenta. Por favor, intentá nuevamente.';
      setRegisterError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-mejorado-card" style={{ maxWidth: '580px' }}>
        {/* Botón volver al home */}
        <Link to="/" className="btn-back-home">
          <span className="back-icon">←</span>
          <span className="back-text">Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="login-header">
          <Link to="/" className="login-logo-wrapper" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <span className="login-logo-icon"><Icon name="minorista" /></span>
            <div className="login-brand">
              <h1 className="brand-name">BuscaDeTodoOnline</h1>
              <p className="brand-tagline">Tu marketplace de confianza</p>
            </div>
          </Link>
          <p className="login-subtitle">Creá tu cuenta gratis</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="register-content">
            {/* Banner de error de registro */}
            {registerError && (
              <div className="login-error-banner" style={{ display: 'flex' }}>
                <span className="error-icon"><Icon name="warning" /></span>
                <div className="error-content">
                  <strong>Error al crear la cuenta</strong>
                  <p>{registerError}</p>
                </div>
                <button
                  type="button"
                  className="error-close"
                  onClick={() => setRegisterError('')}
                  aria-label="Cerrar mensaje de error"
                >
                  <Icon name="close" />
                </button>
              </div>
            )}

            {/* Nombre y Apellido */}
            <div className="form-row-mejorado">
              <div className={`form-group-mejorado ${errors.nombre ? 'error' : ''}`}>
                <label htmlFor="reg-nombre">Nombre *</label>
                <div className="input-wrapper">
                  <input
                    id="reg-nombre"
                    type="text"
                    className="has-icon"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Juan"
                    autoComplete="given-name"
                  />
                  <span className="input-icon" aria-hidden="true"><Icon name="user" /></span>
                </div>
                {errors.nombre && <span className="error-message" role="alert"><Icon name="warning" /> {errors.nombre}</span>}
              </div>

              <div className={`form-group-mejorado ${errors.apellido ? 'error' : ''}`}>
                <label htmlFor="reg-apellido">Apellido *</label>
                <div className="input-wrapper">
                  <input
                    id="reg-apellido"
                    type="text"
                    className="has-icon"
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    placeholder="Pérez"
                    autoComplete="family-name"
                  />
                  <span className="input-icon" aria-hidden="true"><Icon name="user" /></span>
                </div>
                {errors.apellido && <span className="error-message" role="alert"><Icon name="warning" /> {errors.apellido}</span>}
              </div>
            </div>

            {/* DNI */}
            <div className={`form-group-mejorado ${errors.dni ? 'error' : ''}`}>
              <label htmlFor="reg-dni">DNI *</label>
              <div className="input-wrapper">
                <input
                  id="reg-dni"
                  type="text"
                  className="has-icon"
                  value={formData.dni}
                  onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  maxLength="8"
                  autoComplete="off"
                />
                <span className="input-icon" aria-hidden="true">🆔</span>
              </div>
              {errors.dni && <span className="error-message" role="alert"><Icon name="warning" /> {errors.dni}</span>}
            </div>

            {/* Email */}
            <div className={`form-group-mejorado ${errors.email ? 'error' : ''}`}>
              <label htmlFor="reg-email">Email *</label>
              <div className="input-wrapper">
                <input
                  id="reg-email"
                  type="email"
                  className="has-icon"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                <span className="input-icon" aria-hidden="true"><Icon name="mail" /></span>
              </div>
              {errors.email && <span className="error-message" role="alert"><Icon name="warning" /> {errors.email}</span>}
            </div>

            {/* Contraseñas */}
            <div className="form-row-mejorado">
              <div className={`form-group-mejorado ${errors.password ? 'error' : ''}`}>
                <label htmlFor="reg-password">Contraseña *</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    className="has-icon has-toggle"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••"
                    autoComplete="new-password"
                  />
                  <span className="input-icon" aria-hidden="true"><Icon name="lock" /></span>
                  <button
                    type="button"
                    className={`password-toggle ${showPassword ? 'visible' : ''}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="eye-icon"><Icon name="view" /></span>
                  </button>
                </div>
                {errors.password && <span className="error-message" role="alert"><Icon name="warning" /> {errors.password}</span>}
                {formData.password && (
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

              <div className={`form-group-mejorado ${errors.confirmPassword ? 'error' : ''}`}>
                <label htmlFor="reg-confirm-password">Confirmar Contraseña *</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="has-icon has-toggle"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••"
                    autoComplete="new-password"
                  />
                  <span className="input-icon" aria-hidden="true"><Icon name="lock" /></span>
                  <button
                    type="button"
                    className={`password-toggle ${showConfirmPassword ? 'visible' : ''}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="eye-icon"><Icon name="view" /></span>
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span className="success-checkmark">✓</span>
                  )}
                </div>
                {errors.confirmPassword && <span className="error-message" role="alert"><Icon name="warning" /> {errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Botón submit */}
            <button 
              type="submit" 
              className="btn-submit-login"
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span> Creando cuenta...
                </>
              ) : (
                <>Crear Cuenta →</>
              )}
            </button>

            <p className="register-legales">
              Al crear la cuenta aceptás los{' '}
              <Link to="/terminos" target="_blank" rel="noopener noreferrer">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacidad" target="_blank" rel="noopener noreferrer">
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="login-redirect">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterUniversal;
