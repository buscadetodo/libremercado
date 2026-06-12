import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usersService from '../../services/usersService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [codigoPostal, setCodigoPostal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [detectandoUbicacion, setDetectandoUbicacion] = useState(false);
  const [ubicacionError, setUbicacionError] = useState('');
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [ubicacionModalData, setUbicacionModalData] = useState({ tipo: '', mensaje: '', detalles: '' });

  const categorias = [
    { nombre: 'Alimentos', icon: '🍎' },
    { nombre: 'Bebidas', icon: '🥤' },
    { nombre: 'Limpieza', icon: '🧹' },
    { nombre: 'Mascotas', icon: '🐾' }
  ];

  const productosDestacados = [
    {
      nombre: 'Arroz Premium 50kg',
      precio: 25000,
      imagen: '🌾',
      distancia: '2.5 km',
      envio: true
    },
    {
      nombre: 'Aceite Girasol x12',
      precio: 18000,
      imagen: '🛢️',
      distancia: '3.8 km',
      envio: true
    },
    {
      nombre: 'Azúcar Refinada 25kg',
      precio: 15000,
      imagen: '🍬',
      distancia: '1.2 km',
      envio: false
    },
    {
      nombre: 'Harina 0000 50kg',
      precio: 22000,
      imagen: '🍞',
      distancia: '4.1 km',
      envio: true
    }
  ];

  const mayoristas = [
    {
      nombre: 'Distribuidora Norte',
      direccion: 'Av. Corrientes 1234',
      distancia: '1.5 km'
    },
    {
      nombre: 'Almacén Central',
      direccion: 'Calle San Martín 567',
      distancia: '2.3 km'
    },
    {
      nombre: 'Mercado del Sur',
      direccion: 'Av. Rivadavia 890',
      distancia: '3.7 km'
    }
  ];

  const detectarUbicacion = async () => {
    // Limpiar error anterior
    setUbicacionError('');
    
    // Verificar soporte de geolocalización
    if (!navigator.geolocation) {
      setUbicacionError('Tu navegador no soporta geolocalización');
      setUbicacionModalData({
        tipo: 'error',
        mensaje: 'Navegador no compatible',
        detalles: 'Tu navegador no soporta la detección de ubicación automática. Por favor, ingresá tu código postal manualmente.'
      });
      setShowUbicacionModal(true);
      return;
    }

    setDetectandoUbicacion(true);

    try {
      // Obtener posición del usuario
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Hacer reverse geocoding con Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener la dirección');
      }

      const data = await response.json();
      
      // Extraer información de la dirección
      const address = data.address || {};
      const postalCode = address.postcode || address.postal_code || '';
      const city = address.city || address.town || address.village || '';
      const state = address.state || '';
      
      // Si hay código postal, usarlo
      if (postalCode) {
        setCodigoPostal(postalCode);
        setUbicacionModalData({
          tipo: 'success',
          mensaje: '¡Ubicación detectada!',
          detalles: `${data.display_name}\n\nCódigo Postal: ${postalCode}`
        });
        setShowUbicacionModal(true);
      } else if (city) {
        // Si no hay CP pero hay ciudad, mostrar la ciudad
        setCodigoPostal(city);
        setUbicacionModalData({
          tipo: 'success',
          mensaje: '¡Ubicación detectada!',
          detalles: `${data.display_name}\n\nNota: No se pudo obtener el código postal exacto, pero estás en ${city}`
        });
        setShowUbicacionModal(true);
      } else {
        // Mostrar la dirección completa
        const displayAddress = data.display_name || `${latitude}, ${longitude}`;
        setCodigoPostal(displayAddress.split(',')[0]);
        setUbicacionModalData({
          tipo: 'success',
          mensaje: '¡Ubicación detectada!',
          detalles: `${displayAddress}\n\nPodés ajustar manualmente tu ubicación en el campo de búsqueda.`
        });
        setShowUbicacionModal(true);
      }

    } catch (error) {
      console.error('Error al detectar ubicación:', error);
      
      // Mensajes de error específicos
      let mensaje = '';
      let detalles = '';

      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            mensaje = 'Permiso denegado';
            detalles = 'Has denegado el permiso de ubicación.\n\nPara usar esta función, debés permitir el acceso a tu ubicación en la configuración de tu navegador.';
            break;
          case 2: // POSITION_UNAVAILABLE
            mensaje = 'Ubicación no disponible';
            detalles = 'No se pudo determinar tu ubicación.\n\nVerificá tu conexión a internet y que los servicios de ubicación estén activados.';
            break;
          case 3: // TIMEOUT
            mensaje = 'Tiempo agotado';
            detalles = 'Se agotó el tiempo de espera para detectar tu ubicación.\n\nIntentá nuevamente o ingresá tu código postal manualmente.';
            break;
          default:
            mensaje = 'Error desconocido';
            detalles = 'Error desconocido al detectar la ubicación.\n\nPor favor, ingresá tu código postal manualmente.';
        }
      } else {
        mensaje = 'Error al procesar';
        detalles = 'Error al procesar la ubicación.\n\nPor favor, ingresá tu código postal manualmente.';
      }

      setUbicacionError(detalles);
      setUbicacionModalData({
        tipo: 'error',
        mensaje: mensaje,
        detalles: detalles
      });
      setShowUbicacionModal(true);
    } finally {
      setDetectandoUbicacion(false);
    }
  };

  const handleActionRequiresLogin = (action) => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated) {
        setLoadingUser(true);
        try {
          const userId = localStorage.getItem('user_id');
          if (userId) {
            const data = await usersService.getById(userId);
            setUserData(data);
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        } finally {
          setLoadingUser(false);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // Vista para usuarios autenticados
  if (isAuthenticated) {
    return (
      <div className="home-authenticated-container">
        {/* Header Autenticado */}
        <header className="home-header authenticated">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🏪</span>
              <span className="logo-text">Libre Mercado</span>
            </div>
            <div className="header-user-info">
              {loadingUser ? (
                <span>Cargando...</span>
              ) : userData ? (
                <>
                  <span className="user-name">👤 {userData.nombre || userData.email}</span>
                  <Link to="/dashboard" className="btn-dashboard">
                    Panel
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-dashboard">
                    Panel
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Salir
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Bienvenida personalizada */}
        <section className="welcome-section">
          <div className="container">
            <h1 className="welcome-title">
              ¡Bienvenido{userData?.nombre ? `, ${userData.nombre}` : ''}! 👋
            </h1>
            <p className="welcome-subtitle">
              Explorá productos mayoristas en tu zona
            </p>
          </div>
        </section>

        {/* Zona */}
        <section className="zona-section">
          <div className="container">
            <div className="zona-input-group">
              <span className="zona-icon">📍</span>
              <input
                type="text"
                placeholder="Ingresar código postal o ciudad"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                className="zona-input"
                disabled={detectandoUbicacion}
              />
              <button 
                onClick={detectarUbicacion} 
                className={`btn-detectar ${detectandoUbicacion ? 'loading' : ''}`}
                disabled={detectandoUbicacion}
              >
                {detectandoUbicacion ? (
                  <>
                    <span className="spinner-icon">⏳</span>
                    <span>Detectando...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Detectar ubicación</span>
                  </>
                )}
              </button>
            </div>
            {ubicacionError && (
              <div className="ubicacion-error-hint">
                <span>⚠️</span>
                <span>Permiso de ubicación denegado. Ingresá tu código postal manualmente.</span>
              </div>
            )}
          </div>
        </section>

        {/* Buscador */}
        <section className="search-section">
          <div className="container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar productos por mayor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="categorias-section">
          <div className="container">
            <h2 className="section-heading">📂 Categorías</h2>
            <div className="categorias-grid">
              {categorias.map((cat, index) => (
                <button key={index} className="categoria-card">
                  <span className="categoria-icon">{cat.icon}</span>
                  <span className="categoria-nombre">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Ofertas destacadas */}
        <section className="destacados-badges">
          <div className="container">
            <div className="badges-row">
              <div className="badge-item">🔥 Ofertas destacadas</div>
              <div className="badge-item">🛒 Supermercados cercanos</div>
            </div>
          </div>
        </section>

        {/* Productos destacados */}
        <section className="productos-section">
          <div className="container">
            <h2 className="section-heading">📦 Productos destacados (por zona)</h2>
            <div className="productos-grid">
              {productosDestacados.map((producto, index) => (
                <div key={index} className="producto-card">
                  <div className="producto-imagen">{producto.imagen}</div>
                  <div className="producto-info">
                    <h3 className="producto-nombre">{producto.nombre}</h3>
                    <p className="producto-precio">${producto.precio.toLocaleString()}</p>
                    <div className="producto-meta">
                      <span className="producto-distancia">📍 {producto.distancia}</span>
                      <span className={`producto-envio ${producto.envio ? 'disponible' : 'no-disponible'}`}>
                        {producto.envio ? '🚚 Envío' : '❌ Sin envío'}
                      </span>
                    </div>
                    <button 
                      className="btn-comprar"
                      onClick={() => alert('Funcionalidad de compra pendiente')}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mayoristas cercanos */}
        <section className="mayoristas-section">
          <div className="container">
            <h2 className="section-heading">🏪 Mayoristas cercanos</h2>
            <div className="mayoristas-list">
              {mayoristas.map((mayorista, index) => (
                <div key={index} className="mayorista-card">
                  <div className="mayorista-info">
                    <h3 className="mayorista-nombre">{mayorista.nombre}</h3>
                    <p className="mayorista-direccion">{mayorista.direccion}</p>
                    <span className="mayorista-distancia">📍 {mayorista.distancia}</span>
                  </div>
                  <button 
                    className="btn-contactar"
                    onClick={() => alert('Funcionalidad de contacto pendiente')}
                  >
                    Contactar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleteros */}
        <section className="fleteros-section">
          <div className="container">
            <div className="fleteros-cta">
              <h2 className="fleteros-title">🚚 ¿Necesitás un flete?</h2>
              <button 
                className="btn-buscar-fleteros"
                onClick={() => alert('Funcionalidad de búsqueda de fleteros pendiente')}
              >
                Buscar fleteros en tu zona
              </button>
            </div>
          </div>
        </section>

        {/* Modal Ubicación */}
        {showUbicacionModal && (
          <div className="modal-overlay" onClick={() => setShowUbicacionModal(false)}>
            <div className="modal-content ubicacion-modal" onClick={(e) => e.stopPropagation()}>
              <div className={`modal-icon ${ubicacionModalData.tipo === 'success' ? 'success' : 'error'}`}>
                {ubicacionModalData.tipo === 'success' ? '✅' : '⚠️'}
              </div>
              <h3>{ubicacionModalData.mensaje}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{ubicacionModalData.detalles}</p>
              <button 
                className="btn-modal-ubicacion-ok"
                onClick={() => setShowUbicacionModal(false)}
              >
                Entendido
              </button>
              <button 
                className="modal-close"
                onClick={() => setShowUbicacionModal(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista para usuarios NO autenticados
  return (
    <div className="home-public-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">Libre Mercado</span>
          </div>
          <div className="header-actions">
            <Link to="/login" className="btn-login">
              🔐 Login / Register
            </Link>
          </div>
        </div>
      </header>

      {/* Zona */}
      <section className="zona-section">
        <div className="container">
          <div className="zona-input-group">
            <span className="zona-icon">📍</span>
            <input
              type="text"
              placeholder="Ingresar código postal o ciudad"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              className="zona-input"
              disabled={detectandoUbicacion}
            />
            <button 
              onClick={detectarUbicacion} 
              className={`btn-detectar ${detectandoUbicacion ? 'loading' : ''}`}
              disabled={detectandoUbicacion}
            >
              {detectandoUbicacion ? (
                <>
                  <span className="spinner-icon">⏳</span>
                  <span>Detectando...</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Detectar ubicación</span>
                </>
              )}
            </button>
          </div>
          {ubicacionError && (
            <div className="ubicacion-error-hint">
              <span>⚠️</span>
              <span>Permiso de ubicación denegado. Ingresá tu código postal manualmente.</span>
            </div>
          )}
        </div>
      </section>

      {/* Buscador */}
      <section className="search-section">
        <div className="container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos por mayor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="categorias-section">
        <div className="container">
          <h2 className="section-heading">📂 Categorías</h2>
          <div className="categorias-grid">
            {categorias.map((cat, index) => (
              <button key={index} className="categoria-card">
                <span className="categoria-icon">{cat.icon}</span>
                <span className="categoria-nombre">{cat.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas destacadas */}
      <section className="destacados-badges">
        <div className="container">
          <div className="badges-row">
            <div className="badge-item">🔥 Ofertas destacadas</div>
            <div className="badge-item">🛒 Supermercados cercanos</div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="productos-section">
        <div className="container">
          <h2 className="section-heading">📦 Productos destacados (por zona)</h2>
          <div className="productos-grid">
            {productosDestacados.map((producto, index) => (
              <div key={index} className="producto-card">
                <div className="producto-imagen">{producto.imagen}</div>
                <div className="producto-info">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  <p className="producto-precio">${producto.precio.toLocaleString()}</p>
                  <div className="producto-meta">
                    <span className="producto-distancia">📍 {producto.distancia}</span>
                    <span className={`producto-envio ${producto.envio ? 'disponible' : 'no-disponible'}`}>
                      {producto.envio ? '🚚 Envío' : '❌ Sin envío'}
                    </span>
                  </div>
                  <button 
                    className="btn-comprar"
                    onClick={() => handleActionRequiresLogin('comprar')}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mayoristas cercanos */}
      <section className="mayoristas-section">
        <div className="container">
          <h2 className="section-heading">🏪 Mayoristas cercanos</h2>
          <div className="mayoristas-list">
            {mayoristas.map((mayorista, index) => (
              <div key={index} className="mayorista-card">
                <div className="mayorista-info">
                  <h3 className="mayorista-nombre">{mayorista.nombre}</h3>
                  <p className="mayorista-direccion">{mayorista.direccion}</p>
                  <span className="mayorista-distancia">📍 {mayorista.distancia}</span>
                </div>
                <button 
                  className="btn-contactar"
                  onClick={() => handleActionRequiresLogin('contactar')}
                >
                  Contactar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleteros */}
      <section className="fleteros-section">
        <div className="container">
          <div className="fleteros-cta">
            <h2 className="fleteros-title">🚚 ¿Necesitás un flete?</h2>
            <button 
              className="btn-buscar-fleteros"
              onClick={() => handleActionRequiresLogin('flete')}
            >
              Buscar fleteros en tu zona
            </button>
          </div>
        </div>
      </section>

      {/* Modal Login Required */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🔒</div>
            <h3>Para continuar, necesitás crear una cuenta</h3>
            <p>Registrate gratis para acceder a todas las funcionalidades</p>
            <div className="modal-actions">
              <Link to="/registro" className="btn-modal-primary">
                Registrarse
              </Link>
              <Link to="/login" className="btn-modal-secondary">
                Ya tengo cuenta
              </Link>
            </div>
            <button 
              className="modal-close"
              onClick={() => setShowLoginModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal Ubicación */}
      {showUbicacionModal && (
        <div className="modal-overlay" onClick={() => setShowUbicacionModal(false)}>
          <div className="modal-content ubicacion-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${ubicacionModalData.tipo === 'success' ? 'success' : 'error'}`}>
              {ubicacionModalData.tipo === 'success' ? '✅' : '⚠️'}
            </div>
            <h3>{ubicacionModalData.mensaje}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{ubicacionModalData.detalles}</p>
            <button 
              className="btn-modal-ubicacion-ok"
              onClick={() => setShowUbicacionModal(false)}
            >
              Entendido
            </button>
            <button 
              className="modal-close"
              onClick={() => setShowUbicacionModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
