import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import authService from '../../services/authService';
import './AuthMejorado.css';
import './RegisterMejorado.css';

function RegisterUniversal() {
  const navigate = useNavigate();
  const toast = useToast();
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
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
      
      // Login automático
      await authService.login(formData.email, formData.password);
      
      toast.success('¡Bienvenido a LibreMercado!');

      setTimeout(() => {
        navigate('/perfil', { replace: true });
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
            <span className="login-logo-icon">🏪</span>
            <div className="login-brand">
              <h1 className="brand-name">LibreMercado</h1>
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
                <span className="error-icon">⚠️</span>
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
                  ✕
                </button>
              </div>
            )}

            {/* Nombre y Apellido */}
            <div className="form-row-mejorado">
              <div className={`form-group-mejorado ${errors.nombre ? 'error' : ''}`}>
                <label>Nombre *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="has-icon"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Juan"
                    autoComplete="given-name"
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
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    placeholder="Pérez"
                    autoComplete="family-name"
                  />
                  <span className="input-icon">👤</span>
                </div>
                {errors.apellido && <span className="error-message">⚠️ {errors.apellido}</span>}
              </div>
            </div>

            {/* DNI */}
            <div className={`form-group-mejorado ${errors.dni ? 'error' : ''}`}>
              <label>DNI *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="has-icon"
                  value={formData.dni}
                  onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  maxLength="8"
                  autoComplete="off"
                />
                <span className="input-icon">🆔</span>
              </div>
              {errors.dni && <span className="error-message">⚠️ {errors.dni}</span>}
            </div>

            {/* Email */}
            <div className={`form-group-mejorado ${errors.email ? 'error' : ''}`}>
              <label>Email *</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="has-icon"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                <span className="input-icon">📧</span>
              </div>
              {errors.email && <span className="error-message">⚠️ {errors.email}</span>}
            </div>

            {/* Contraseñas */}
            <div className="form-row-mejorado">
              <div className={`form-group-mejorado ${errors.password ? 'error' : ''}`}>
                <label>Contraseña *</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="has-icon has-toggle"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••"
                    autoComplete="new-password"
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
                <label>Confirmar Contraseña *</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="has-icon has-toggle"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••"
                    autoComplete="new-password"
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
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span className="success-checkmark">✓</span>
                  )}
                </div>
                {errors.confirmPassword && <span className="error-message">⚠️ {errors.confirmPassword}</span>}
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
