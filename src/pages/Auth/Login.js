import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useToast } from '../../components/Toast/Toast';
import usuarioPerfilesService from '../../services/usuarioPerfilesService';
import './AuthMejorado.css';
import './RegisterMejorado.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const determinarRedireccion = async (userData) => {
    try {
      const perfilesResponse = await usuarioPerfilesService.getByUserId(userData.id);
      const perfiles = perfilesResponse.data || [];

      if (userData.id_rol === 1) {
        return '/dashboard';
      }

      if (perfiles.length === 0) {
        return '/perfil';
      }

      const perfilActual = perfiles[0];
      const dashboardMap = {
        'mayorista': '/mayorista/dashboard',
        'minorista': '/minorista/dashboard',
        'comprador': '/comprador/home',
        'transportista': '/transportista/dashboard'
      };

      return dashboardMap[perfilActual.perfil?.nombre?.toLowerCase()] || '/dashboard';
    } catch (error) {
      console.error('Error al determinar redirección:', error);
      return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('¡Bienvenido de nuevo!');
        const redirectUrl = await determinarRedireccion(result.user);
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 500);
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      toast.error(mensaje);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-mejorado-card">
        {/* Header con logo mejorado */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <span className="login-logo-icon">🏪</span>
            <div className="login-brand">
              <h1 className="brand-name">LibreMercado</h1>
              <p className="brand-tagline">Tu marketplace de confianza</p>
            </div>
          </div>
          <p className="login-subtitle">Ingresá a tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="register-content">
            {/* Email */}
            <div className={`form-group-mejorado ${errors.email ? 'error' : ''}`}>
              <label>Email *</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="has-icon"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({...errors, email: ''});
                  }}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                <span className="input-icon">📧</span>
              </div>
              {errors.email && <span className="error-message">⚠️ {errors.email}</span>}
            </div>

            {/* Contraseña */}
            <div className={`form-group-mejorado ${errors.password ? 'error' : ''}`}>
              <label>Contraseña *</label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="has-icon has-toggle"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({...errors, password: ''});
                  }}
                  placeholder="••••••"
                  autoComplete="current-password"
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
            </div>

            {/* Extras: Recordarme y Olvidé contraseña */}
            <div className="login-extras">
              <label className="remember-me-checkbox">
                <input type="checkbox" />
                <span className="checkmark"></span>
                <span className="remember-text">Recordarme</span>
              </label>
              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => toast.info('Función disponible próximamente')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón submit */}
            <button 
              type="submit" 
              className="btn-submit-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span> Iniciando sesión...
                </>
              ) : (
                <>Iniciar Sesión →</>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-redirect">
          ¿No tenés cuenta? <Link to="/registro">Registrate aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
