import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usersService from '../../services/usersService';
import './Perfil.css';

function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    dni: '',
    id_rol: '',
    email_verificado: '',
    estado_cuenta: '',
    password: '', // Opcional
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el ID del usuario del token o localStorage
      let storedUserId = localStorage.getItem('user_id');
      
      // Si no hay user_id en localStorage, intentar obtener la lista de usuarios
      // y encontrar el que coincida con el email del token
      if (!storedUserId) {
        try {
          // Intentar decodificar el token para obtener info del usuario
          const token = localStorage.getItem('access_token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Buscar user_id en diferentes campos comunes del JWT
            storedUserId = payload.user_id || payload.sub || payload.id;
            
            // Si encontramos el ID, guardarlo
            if (storedUserId) {
              localStorage.setItem('user_id', storedUserId);
            } else {
              // Si no podemos obtener el ID del token, buscar en la lista de usuarios
              const usersResponse = await usersService.getAll({ limit: 100 });
              const usersList = usersResponse.data?.data || usersResponse.data || [];
              
              // Buscar el usuario actual por email (si está en el token)
              if (payload.email && usersList.length > 0) {
                const currentUser = usersList.find(u => u.email === payload.email);
                if (currentUser) {
                  storedUserId = currentUser.id;
                  localStorage.setItem('user_id', storedUserId);
                }
              }
            }
          }
        } catch (decodeError) {
          console.error('Error al decodificar token:', decodeError);
        }
      }
      
      if (!storedUserId) {
        setError('No se pudo identificar tu usuario. Por favor, cierra sesión e inicia sesión nuevamente.');
        return;
      }

      setUserId(storedUserId);

      // Obtener datos del usuario
      const response = await usersService.getById(storedUserId);
      const userData = response.data;

      setFormData({
        email: userData.email || '',
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        dni: userData.dni || '',
        id_rol: userData.id_rol || '',
        email_verificado: userData.email_verificado || 'n',
        estado_cuenta: userData.estado_cuenta || 'y',
        password: '', // No cargar contraseña
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.detail || 
                         'Error al cargar el perfil';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);

      // Preparar datos para actualizar
      const updateData = {
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        id_rol: formData.id_rol,
        email_verificado: formData.email_verificado,
        estado_cuenta: formData.estado_cuenta,
      };

      // Solo incluir password si se ingresó uno nuevo
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await usersService.update(userId, updateData);
      
      setSuccess(true);
      
      // Limpiar el campo de contraseña después de guardar
      setFormData({
        ...formData,
        password: ''
      });

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.detail || 
                         'Error al actualizar el perfil';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <div className="loading">⏳ Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <h1>⚙️ Mi Perfil</h1>
        <p className="page-subtitle">Administra tu información personal</p>
      </div>

      <div className="perfil-container">
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>Perfil actualizado correctamente</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="perfil-form">
          <div className="form-section">
            <h3>Información Personal</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <input
                id="dni"
                name="dni"
                type="text"
                value={formData.dni}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="12345678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Cambiar Contraseña</h3>
            <p className="form-hint">Deja en blanco si no deseas cambiar tu contraseña</p>
            
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                minLength={6}
              />
              <small className="form-help">Mínimo 6 caracteres</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Estado de Cuenta</h3>
            
            <div className="info-grid">
              <div className="info-card">
                <span className="info-label">Email Verificado</span>
                <span className={`status-badge ${formData.email_verificado === 'y' ? 'status-active' : 'status-inactive'}`}>
                  {formData.email_verificado === 'y' ? '✅ Verificado' : '❌ No Verificado'}
                </span>
              </div>

              <div className="info-card">
                <span className="info-label">Estado de Cuenta</span>
                <span className={`status-badge ${formData.estado_cuenta === 'y' ? 'status-active' : 'status-inactive'}`}>
                  {formData.estado_cuenta === 'y' ? '✅ Activa' : '❌ Inactiva'}
                </span>
              </div>

              <div className="info-card">
                <span className="info-label">ID de Usuario</span>
                <span className="info-value">#{userId}</span>
              </div>

              <div className="info-card">
                <span className="info-label">Rol</span>
                <span className="info-value">ID: {formData.id_rol}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
