import React, { useState } from 'react';
import { useAuth, useRubros } from '../hooks';
import './LoginComponent.css';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nuevoRubro, setNuevoRubro] = useState('');

  // Hook de autenticación
  const { login, logout, loading: authLoading, error: authError, isAuthenticated } = useAuth();

  // Hook de rubros
  const { 
    rubros, 
    loading: rubrosLoading, 
    error: rubrosError, 
    fetchRubros,
    createRubro 
  } = useRubros();

  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      console.log('Login exitoso:', result.data);
      // Cargar rubros después del login
      fetchRubros();
    }
  };

  // Manejar creación de rubro
  const handleCreateRubro = async (e) => {
    e.preventDefault();
    if (!nuevoRubro.trim()) {
      alert('Por favor ingresa un nombre para el rubro');
      return;
    }
    
    const result = await createRubro(nuevoRubro);
    
    if (result.success) {
      alert('✅ Rubro creado exitosamente');
      setNuevoRubro('');
      fetchRubros();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  // Manejar carga de rubros
  const handleLoadRubros = () => {
    fetchRubros();
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>🚀 LibreMercado</h1>
        <p className="subtitle">Sistema de Gestión</p>
      </div>

      {/* Sección de Login/Logout */}
      {!isAuthenticated ? (
        <div className="card login-card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <div className="error-message">
                <span>⚠️</span> {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <span className="spinner"></span> Cargando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="card session-card">
            <div className="session-info">
              <span className="status-badge">✓ Sesión Activa</span>
              <button onClick={logout} className="btn btn-secondary">
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Sección de Gestión de Rubros */}
          <div className="rubros-section">
            <div className="card">
              <h2>Crear Nuevo Rubro</h2>
              <form onSubmit={handleCreateRubro} className="create-form">
                <div className="form-group-inline">
                  <input
                    type="text"
                    placeholder="Nombre del rubro (ej: Electrónica)"
                    value={nuevoRubro}
                    onChange={(e) => setNuevoRubro(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success">
                    ➕ Crear
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Lista de Rubros</h2>
                <button 
                  onClick={handleLoadRubros} 
                  className="btn btn-outline"
                  disabled={rubrosLoading}
                >
                  {rubrosLoading ? '⏳ Cargando...' : '🔄 Actualizar'}
                </button>
              </div>
              
              {rubrosLoading && (
                <div className="loading-state">
                  <span className="spinner"></span>
                  <p>Cargando rubros...</p>
                </div>
              )}
              
              {rubrosError && (
                <div className="error-message">
                  <span>⚠️</span> {rubrosError}
                </div>
              )}
              
              {rubros && !rubrosLoading && (
                <div className="rubros-list">
                  {Array.isArray(rubros) && rubros.length > 0 ? (
                    <ul>
                      {rubros.map((rubro, index) => (
                        <li key={rubro.id || index}>
                          <span className="rubro-icon">📦</span>
                          <span className="rubro-name">
                            {rubro.rubro || rubro.nombre || JSON.stringify(rubro)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">
                      No hay rubros disponibles. ¡Crea el primero!
                    </p>
                  )}
                </div>
              )}
              
              {!rubros && !rubrosLoading && !rubrosError && (
                <p className="empty-state">
                  Haz clic en "Actualizar" para cargar los rubros
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginComponent;
