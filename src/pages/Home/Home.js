import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { usePerfilActivo } from '../../context/PerfilContext';
import usersService from '../../services/usersService';
import mayoristasService from '../../services/mayoristasService';
import rubrosService from '../../services/rubrosService';
import productosService from '../../services/productosService';
import { FEATURE_PRODUCTOS } from '../../config/features';
import Modal from '../../components/Modal/Modal';
import Icon from '../../components/Icon/Icon';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  // panelUrl ya resuelve admin vs. dashboard del perfil (ver PerfilContext)
  const { panelUrl } = usePerfilActivo();
  const [codigoPostal, setCodigoPostal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [mayoristasReales, setMayoristasReales] = useState([]);
  const [loadingMayoristas, setLoadingMayoristas] = useState(false);
  const [productosReales, setProductosReales] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [rubrosMap, setRubrosMap] = useState({});
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [detectandoUbicacion, setDetectandoUbicacion] = useState(false);
  const [ubicacionError, setUbicacionError] = useState('');
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [ubicacionModalData, setUbicacionModalData] = useState({ tipo: '', mensaje: '', detalles: '' });

  const categorias = [
    { nombre: 'Alimentos', icon: 'alimentos' },
    { nombre: 'Bebidas', icon: 'bebidas' },
    { nombre: 'Limpieza', icon: 'limpieza' },
    { nombre: 'Mascotas', icon: 'mascotas' }
  ];

  // Datos de muestra del landing público (visitante sin sesión).
  // No se pueden reemplazar por datos reales porque GET /productos/ y
  // GET /mayoristas/ exigen token. Con sesión iniciada se usan los datos
  // reales (ver productosReales / mayoristasReales más abajo).
  const productosDestacados = [
    {
      nombre: 'Arroz Premium 50kg',
      precio: 25000,
      imagen: 'granos',
      distancia: '2.5 km',
      envio: true
    },
    {
      nombre: 'Aceite Girasol x12',
      precio: 18000,
      imagen: 'aceites',
      distancia: '3.8 km',
      envio: true
    },
    {
      nombre: 'Azúcar Refinada 25kg',
      precio: 15000,
      imagen: 'golosinas',
      distancia: '1.2 km',
      envio: false
    },
    {
      nombre: 'Harina 0000 50kg',
      precio: 22000,
      imagen: 'panificados',
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
            mensaje = 'Permiso de ubicación denegado';
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

      setUbicacionError(mensaje);
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
            const response = await usersService.getById(userId);
            // La API envuelve la respuesta en { success, data }
            setUserData(response?.data ?? response);
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

  // Cargar mayoristas reales y rubros (para mapear nombres) si está autenticado
  useEffect(() => {
    const loadMayoristas = async () => {
      if (!isAuthenticated) return;
      setLoadingMayoristas(true);
      try {
        const [mayoristasResp, rubrosResp] = await Promise.all([
          mayoristasService.getAll({ limit: 6 }),
          rubrosService.getAll(50, 0),
        ]);

        const lista = mayoristasResp?.data ?? mayoristasResp ?? [];
        setMayoristasReales(Array.isArray(lista) ? lista : []);

        const rubrosLista = rubrosResp?.data ?? rubrosResp ?? [];
        const map = {};
        (Array.isArray(rubrosLista) ? rubrosLista : []).forEach((r) => {
          map[r.id] = r.rubro;
        });
        setRubrosMap(map);
      } catch (error) {
        console.error('Error al cargar mayoristas:', error);
      } finally {
        setLoadingMayoristas(false);
      }
    };

    loadMayoristas();
  }, [isAuthenticated]);

  // Productos destacados con datos reales.
  // GET /productos/ exige token, así que sólo se pide con sesión iniciada.
  useEffect(() => {
    const loadProductos = async () => {
      if (!isAuthenticated || !FEATURE_PRODUCTOS) return;
      setLoadingProductos(true);
      try {
        const resp = await productosService.getAll({ limit: 4 });
        const lista = resp?.data ?? resp ?? [];
        setProductosReales(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setProductosReales([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    loadProductos();
  }, [isAuthenticated]);

  // Categorías reales a partir de los rubros de la API
  const iconosRubro = {
    electronica: 'electronica', alimentos: 'alimentos', bebidas: 'bebidas', limpieza: 'limpieza', mascotas: 'mascotas'
  };
  const categoriasReales = Object.entries(rubrosMap).map(([id, nombre]) => ({
    id: Number(id),
    nombre,
    icon: iconosRubro[nombre?.toLowerCase()] || 'folder',
  }));

  // Mayoristas filtrados por categoría (rubro) y por texto de búsqueda
  const mayoristasFiltrados = mayoristasReales.filter((m) => {
    const coincideRubro = !categoriaFiltro || m.rubro_id === categoriaFiltro;
    const texto = searchQuery.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      m.razon_social?.toLowerCase().includes(texto) ||
      m.descripcion?.toLowerCase().includes(texto);
    return coincideRubro && coincideTexto;
  });

  // Modal de ubicación: es el mismo con y sin sesión
  const cerrarUbicacionModal = () => setShowUbicacionModal(false);
  const modalUbicacion = showUbicacionModal && (
    <Modal
      onClose={cerrarUbicacionModal}
      titleId="ubicacion-modal-titulo"
      overlayClassName="modal-overlay"
      className="modal-content ubicacion-modal"
    >
      <div
        className={`modal-icon ${ubicacionModalData.tipo === 'success' ? 'success' : 'error'}`}
        aria-hidden="true"
      >
        <Icon name={ubicacionModalData.tipo === 'success' ? 'success' : 'warning'} />
      </div>
      <h3 id="ubicacion-modal-titulo">{ubicacionModalData.mensaje}</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{ubicacionModalData.detalles}</p>
      <button className="btn-modal-ubicacion-ok" onClick={cerrarUbicacionModal}>
        Entendido
      </button>
      <button className="modal-close" onClick={cerrarUbicacionModal} aria-label="Cerrar">
        <Icon name="close" />
      </button>
    </Modal>
  );

  // Vista para usuarios autenticados
  if (isAuthenticated) {
    return (
      <div className="home-authenticated-container">
        {/* Header Autenticado */}
        <header className="home-header authenticated">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon"><Icon name="minorista" /></span>
              <span className="logo-text">BuscaDeTodoOnline</span>
            </div>
            <div className="header-user-info">
              {loadingUser ? (
                <span>Cargando...</span>
              ) : userData ? (
                <>
                  <span className="user-name"><Icon name="user" /> {userData.nombre || userData.email}</span>
                  <Link to={panelUrl} className="btn-dashboard">
                    Panel
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to={panelUrl} className="btn-dashboard">
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
              ¡Bienvenido{userData?.nombre ? `, ${userData.nombre}` : ''}!
            </h1>
            <p className="welcome-subtitle">
              Explorá productos mayoristas en tu zona
            </p>
          </div>
        </section>

        {/* Zona */}
        <section className="zona-section">
          <div className="container">
            <label htmlFor="zona-input" className="field-label">
              Tu zona
            </label>
            <div className="zona-input-group">
              <span className="zona-icon"><Icon name="location" /></span>
              <input
                id="zona-input"
                type="text"
                placeholder="Código postal o ciudad"
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
                    <span className="spinner-icon"><Icon name="loading" /></span>
                    <span>Detectando...</span>
                  </>
                ) : (
                  <>
                    <Icon name="location" />
                    <span>Detectar ubicación</span>
                  </>
                )}
              </button>
            </div>
            {ubicacionError && (
              <div className="ubicacion-error-hint">
                <Icon name="warning" />
                <span>{ubicacionError}. Ingresá tu código postal manualmente.</span>
              </div>
            )}
          </div>
        </section>

        {/* Buscador */}
        <section className="search-section">
          <div className="container">
            <label htmlFor="search-input" className="field-label">
              Buscar mayoristas
            </label>
            <div className="search-box">
              <span className="search-icon"><Icon name="search" /></span>
              <input
                id="search-input"
                type="search"
                placeholder="Nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </section>

        {/* Categorías (rubros reales) — filtran la lista de mayoristas */}
        {categoriasReales.length > 0 && (
          <section className="categorias-section">
            <div className="container">
              <h2 className="section-heading"><Icon name="folder" /> Categorías</h2>
              <div className="categorias-grid">
                <button
                  className={`categoria-card ${categoriaFiltro === '' ? 'active' : ''}`}
                  onClick={() => setCategoriaFiltro('')}
                >
                  <span className="categoria-icon"><Icon name="folders" /></span>
                  <span className="categoria-nombre">Todas</span>
                </button>
                {categoriasReales.map((cat) => (
                  <button
                    key={cat.id}
                    className={`categoria-card ${categoriaFiltro === cat.id ? 'active' : ''}`}
                    onClick={() => setCategoriaFiltro(cat.id)}
                  >
                    <span className="categoria-icon"><Icon name={cat.icon} /></span>
                    <span className="categoria-nombre">{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ofertas destacadas */}
        <section className="destacados-badges">
          <div className="container">
            <div className="badges-row">
              <div className="badge-item"><Icon name="hot" /> Ofertas destacadas</div>
              <div className="badge-item"><Icon name="cart" /> Supermercados cercanos</div>
            </div>
          </div>
        </section>

        {/* Productos destacados (datos reales de la API).
            Sin sesión no se muestra: GET /productos/ requiere token. */}
        {FEATURE_PRODUCTOS && isAuthenticated && (
          <section className="productos-section">
            <div className="container">
              <h2 className="section-heading"><Icon name="package" /> Productos destacados</h2>
              {loadingProductos ? (
                <p className="mayoristas-empty">Cargando productos...</p>
              ) : productosReales.length === 0 ? (
                <p className="mayoristas-empty">
                  Todavía no hay productos publicados en la plataforma.
                </p>
              ) : (
                <div className="productos-grid">
                  {productosReales.map((producto) => (
                    <div key={producto.id} className="producto-card">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="producto-imagen-real"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="producto-imagen"><Icon name="package" /></div>
                      )}
                      <div className="producto-info">
                        <h3 className="producto-nombre">{producto.nombre}</h3>
                        <p className="producto-precio">
                          ${Number(producto.precio || 0).toLocaleString('es-AR')}
                        </p>
                        <div className="producto-meta">
                          <span className="producto-distancia">
                            {rubrosMap[producto.rubro_id] || 'Sin rubro'}
                          </span>
                          <span
                            className={`producto-envio ${
                              producto.stock > 0 ? 'disponible' : 'no-disponible'
                            }`}
                          >
                            {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
                          </span>
                        </div>
                        <Link to="/productos" className="btn-comprar">
                          Ver catálogo
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Mayoristas (datos reales de la API) */}
        <section className="mayoristas-section">
          <div className="container">
            <h2 className="section-heading"><Icon name="mayorista" /> Mayoristas</h2>
            {loadingMayoristas ? (
              <p className="mayoristas-empty">Cargando mayoristas...</p>
            ) : mayoristasReales.length === 0 ? (
              <p className="mayoristas-empty">
                Todavía no hay mayoristas disponibles en la plataforma.
              </p>
            ) : mayoristasFiltrados.length === 0 ? (
              <p className="mayoristas-empty">
                No se encontraron mayoristas con esos filtros.
              </p>
            ) : (
              <div className="mayoristas-list">
                {mayoristasFiltrados.map((m) => (
                  <div key={m.id} className="mayorista-card">
                    <div className="mayorista-info">
                      <h3 className="mayorista-nombre">{m.razon_social}</h3>
                      {m.descripcion && (
                        <p className="mayorista-direccion">{m.descripcion}</p>
                      )}
                      <div className="mayorista-tags">
                        {rubrosMap[m.rubro_id] && (
                          <span className="mayorista-tag"><Icon name="folder" /> {rubrosMap[m.rubro_id]}</span>
                        )}
                        {Number(m.pedido_minimo) > 0 && (
                          <span className="mayorista-tag">
                            <Icon name="receipt" /> Pedido mín. ${Number(m.pedido_minimo).toLocaleString()}
                          </span>
                        )}
                        {m.retiro_en_local === 'y' && (
                          <span className="mayorista-tag"><Icon name="local" /> Retira en local</span>
                        )}
                      </div>
                    </div>
                    {/* Sin flujo de contacto todavía: se muestra desactivado (informe QA 30/09) */}
                    <button
                      className="btn-contactar"
                      disabled
                      title="Disponible próximamente"
                      aria-label={`Contacto con ${m.razon_social}: disponible próximamente`}
                    >
                      Contacto próximamente
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {modalUbicacion}
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
            <span className="logo-icon"><Icon name="minorista" /></span>
            <span className="logo-text">BuscaDeTodoOnline</span>
          </div>
          <div className="header-actions">
            <Link to="/login" className="btn-login">
              <span className="btn-login-full">Iniciar sesión / Registrarse</span>
              <span className="btn-login-short">Ingresar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Zona */}
      <section className="zona-section">
        <div className="container">
          <h1 className="home-hero-title">Comprá por mayor cerca de tu zona</h1>
          <p className="home-hero-subtitle">
            Mayoristas, minoristas y fleteros en un solo lugar
          </p>
          <label htmlFor="zona-input" className="field-label">
            Tu zona
          </label>
          <div className="zona-input-group">
            <span className="zona-icon"><Icon name="location" /></span>
            <input
              id="zona-input"
              type="text"
              placeholder="Código postal o ciudad"
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
                  <span className="spinner-icon"><Icon name="loading" /></span>
                  <span>Detectando...</span>
                </>
              ) : (
                <>
                  <Icon name="location" />
                  <span>Detectar ubicación</span>
                </>
              )}
            </button>
          </div>
          {ubicacionError && (
            <div className="ubicacion-error-hint">
              <Icon name="warning" />
              <span>{ubicacionError}. Ingresá tu código postal manualmente.</span>
            </div>
          )}
        </div>
      </section>

      {/* Buscador */}
      <section className="search-section">
        <div className="container">
          <label htmlFor="search-input" className="field-label">
            Buscar productos
          </label>
          <div className="search-box">
            <span className="search-icon"><Icon name="search" /></span>
            <input
              id="search-input"
              type="search"
              placeholder="Productos por mayor..."
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
          <h2 className="section-heading"><Icon name="folder" /> Categorías</h2>
          <div className="categorias-grid">
            {categorias.map((cat, index) => (
              <button key={index} className="categoria-card">
                <span className="categoria-icon"><Icon name={cat.icon} /></span>
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
            <div className="badge-item"><Icon name="hot" /> Ofertas destacadas</div>
            <div className="badge-item"><Icon name="cart" /> Supermercados cercanos</div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="productos-section">
        <div className="container">
          <h2 className="section-heading"><Icon name="package" /> Productos destacados (por zona)</h2>
          <div className="productos-grid">
            {productosDestacados.map((producto, index) => (
              <div key={index} className="producto-card">
                <div className="producto-imagen"><Icon name={producto.imagen} /></div>
                <div className="producto-info">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  <p className="producto-precio">${producto.precio.toLocaleString()}</p>
                  <div className="producto-meta">
                    <span className="producto-distancia"><Icon name="location" /> {producto.distancia}</span>
                    <span className={`producto-envio ${producto.envio ? 'disponible' : 'no-disponible'}`}>
                      {producto.envio ? <><Icon name="transportista" /> Envío</> : <><Icon name="error" /> Sin envío</>}
                    </span>
                  </div>
                  <button 
                    className="btn-comprar"
                    onClick={() => handleActionRequiresLogin('comprar')}
                    aria-label={`Comprar ${producto.nombre}`}
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
          <h2 className="section-heading"><Icon name="mayorista" /> Mayoristas cercanos</h2>
          <div className="mayoristas-list">
            {mayoristas.map((mayorista, index) => (
              <div key={index} className="mayorista-card">
                <div className="mayorista-info">
                  <h3 className="mayorista-nombre">{mayorista.nombre}</h3>
                  <p className="mayorista-direccion">{mayorista.direccion}</p>
                  <span className="mayorista-distancia"><Icon name="location" /> {mayorista.distancia}</span>
                </div>
                <button 
                  className="btn-contactar"
                  onClick={() => handleActionRequiresLogin('contactar')}
                  aria-label={`Contactar a ${mayorista.nombre}`}
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
            <h2 className="fleteros-title"><Icon name="transportista" /> ¿Necesitás un flete?</h2>
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
        <Modal
          onClose={() => setShowLoginModal(false)}
          titleId="login-modal-titulo"
          overlayClassName="modal-overlay"
          className="modal-content"
        >
          <div className="modal-icon"><Icon name="lock" /></div>
          <h3 id="login-modal-titulo">Para continuar, necesitás crear una cuenta</h3>
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
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </Modal>
      )}

      {modalUbicacion}
    </div>
  );
}

export default Home;
