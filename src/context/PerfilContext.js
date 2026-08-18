import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import usuarioPerfilesService from '../services/usuarioPerfilesService';
import mayoristasService from '../services/mayoristasService';
import minoristasService from '../services/minoristasService';
import transportistasService from '../services/transportistasService';
import compradoresService from '../services/compradoresService';
import useAuth from '../hooks/useAuth';
import { esAdmin } from '../config/roles';

const PerfilContext = createContext();

export const usePerfilActivo = () => {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error('usePerfilActivo debe usarse dentro de PerfilProvider');
  }
  return context;
};

export const PerfilProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivo, setPerfilActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfiles = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await usuarioPerfilesService.getByUser(user.id);
      const perfilesUsuario = response?.data || [];
      
      setPerfiles(perfilesUsuario);
      
      // Cargar perfil activo guardado o usar el primero
      const perfilGuardado = localStorage.getItem('perfil_activo');
      if (perfilGuardado) {
        const perfil = perfilesUsuario.find(p => p.id_perfil.toString() === perfilGuardado);
        setPerfilActivo(perfil || perfilesUsuario[0]);
      } else {
        setPerfilActivo(perfilesUsuario[0]);
      }
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      setPerfiles([]);
      setPerfilActivo(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar perfiles del usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      cargarPerfiles();
    } else {
      setPerfiles([]);
      setPerfilActivo(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, cargarPerfiles]);

  // ---------------------------------------------------------------------
  // Fichas del usuario (mayorista / minorista / transportista / comprador)
  //
  // Viven acá y no en cada pantalla porque las consultan el Sidebar, los
  // dashboards y los formularios: resolverlas por componente significaba
  // repetir las mismas requests en cada navegación.
  //
  // Tener el perfil asignado no implica tener la ficha: son dos registros
  // distintos y el alta puede quedar a medio camino.
  // ---------------------------------------------------------------------
  const [fichas, setFichas] = useState({
    mayorista: [],
    minorista: [],
    transportista: [],
    comprador: [],
  });
  // Arranca en true: hasta que se resuelva la primera carga no se puede saber
  // si falta la ficha, y asumir que falta hace parpadear el aviso.
  const [loadingComercios, setLoadingComercios] = useState(true);
  const [errorComercios, setErrorComercios] = useState(null);

  const nombresPerfiles = perfiles.map((p) => p.perfil?.toLowerCase()).filter(Boolean);
  const esComerciante =
    nombresPerfiles.includes('mayorista') || nombresPerfiles.includes('minorista');
  const isAdmin = esAdmin(user);
  // Se serializa para que el efecto no se dispare en cada render por identidad.
  const clavePerfiles = nombresPerfiles.slice().sort().join(',');

  const cargarComercios = useCallback(async () => {
    if (!user?.id) {
      setFichas({ mayorista: [], minorista: [], transportista: [], comprador: [] });
      setLoadingComercios(false);
      return;
    }

    setLoadingComercios(true);
    setErrorComercios(null);

    // El admin ve todos; el resto solo los propios (filtro id_usuario).
    const filtros = isAdmin ? { limit: 100 } : { id_usuario: user.id, limit: 100 };
    const tienePerfilDe = (t) => clavePerfiles.split(',').includes(t);

    // Mayorista y minorista se piden también para el admin y para el selector de
    // comercios del alta de productos. Transportista y comprador solo interesan
    // para saber si al usuario le falta esa ficha, así que se piden únicamente
    // si tiene el perfil: no tiene sentido gastarle requests a los demás.
    const pedidos = [
      { tipo: 'mayorista', pedir: isAdmin || esComerciante, fn: () => mayoristasService.getAll(filtros) },
      { tipo: 'minorista', pedir: isAdmin || esComerciante, fn: () => minoristasService.getAll(filtros) },
      { tipo: 'transportista', pedir: !isAdmin && tienePerfilDe('transportista'), fn: () => transportistasService.getAll(filtros) },
      { tipo: 'comprador', pedir: !isAdmin && tienePerfilDe('comprador'), fn: () => compradoresService.getAll(filtros) },
    ];

    const activos = pedidos.filter((p) => p.pedir);

    try {
      // allSettled: si un recurso falla, los otros igual se cargan.
      const respuestas = await Promise.allSettled(activos.map((p) => p.fn()));

      const listar = (resp) => {
        if (!resp || resp.status !== 'fulfilled') return [];
        const data = resp.value?.data ?? resp.value;
        return Array.isArray(data) ? data : [];
      };

      const nuevas = { mayorista: [], minorista: [], transportista: [], comprador: [] };
      activos.forEach((p, i) => {
        nuevas[p.tipo] = listar(respuestas[i]);
      });
      setFichas(nuevas);

      if (respuestas.length && respuestas.every((r) => r.status === 'rejected')) {
        setErrorComercios('No se pudieron cargar tus comercios');
      }
    } catch (err) {
      setErrorComercios('No se pudieron cargar tus comercios');
    } finally {
      setLoadingComercios(false);
    }
  }, [user?.id, isAdmin, esComerciante, clavePerfiles]);

  // Solo se piden si pueden existir: sin perfil que las requiera no hay ficha
  // que buscar, y no tiene sentido gastarle requests al usuario.
  useEffect(() => {
    const necesitaFichas =
      isAdmin || esComerciante || clavePerfiles.split(',').some((p) =>
        ['transportista', 'comprador'].includes(p)
      );

    if (isAuthenticated && necesitaFichas) {
      cargarComercios();
    } else {
      setFichas({ mayorista: [], minorista: [], transportista: [], comprador: [] });
      // Nada que esperar: sin perfil no hay ficha que pueda faltar.
      if (!loading) setLoadingComercios(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, esComerciante, clavePerfiles, loading, cargarComercios]);

  /**
   * ¿Existe la ficha de ese tipo para el usuario?
   * Se compara por id_usuario porque el admin recibe las de todo el sistema.
   */
  const tieneFicha = (tipo) =>
    (fichas[tipo] || []).some((f) => String(f.id_usuario) === String(user?.id));

  /**
   * Tipos con el perfil asignado pero sin su ficha cargada.
   * Es el estado que deja al usuario a mitad de camino: se ve como mayorista
   * (o transportista) pero la API lo trata como si no existiera, porque el
   * registro del recurso nunca se creó.
   * El admin queda afuera: recibe las fichas de todo el sistema.
   */
  const tiposSinFicha =
    isAdmin || loading || loadingComercios
      ? []
      : ['mayorista', 'minorista', 'transportista', 'comprador'].filter(
          (tipo) => nombresPerfiles.includes(tipo) && !tieneFicha(tipo)
        );

  // Un usuario sin ningún perfil no puede hacer nada en la app: el onboarding
  // quedó incompleto y hay que poder mandarlo a elegirlo.
  const sinNingunPerfil = !loading && !isAdmin && perfiles.length === 0;

  const cambiarPerfil = (perfilId) => {
    const perfil = perfiles.find(p => p.id_perfil === perfilId);
    if (perfil) {
      setPerfilActivo(perfil);
      localStorage.setItem('perfil_activo', perfilId.toString());
    }
  };

  const obtenerDashboardUrl = (perfil) => {
    if (!perfil) return '/dashboard';
    
    const perfilNombre = perfil.perfil?.toLowerCase();
    const dashboardMap = {
      'mayorista': '/mayorista/dashboard',
      'minorista': '/minorista/dashboard',
      'comprador': '/comprador/home',
      'transportista': '/transportista/dashboard'
    };

    return dashboardMap[perfilNombre] || '/dashboard';
  };

  const tienePerfil = (nombrePerfil) => {
    return perfiles.some(p => p.perfil?.toLowerCase() === nombrePerfil.toLowerCase());
  };

  // Destino del boton "Panel"/"Volver": /dashboard es adminOnly, asi que a un
  // usuario comun hay que mandarlo al dashboard de su perfil. Si no se puede
  // mapear, /perfil, que si es accesible para cualquier usuario logueado.
  const panelUrl = (() => {
    if (esAdmin(user)) return '/dashboard';
    const perfil = perfilActivo || perfiles[0];
    if (!perfil) return '/perfil';
    const url = obtenerDashboardUrl(perfil);
    return url === '/dashboard' ? '/perfil' : url;
  })();

  const value = {
    perfiles,
    perfilActivo,
    loading,
    cambiarPerfil,
    cargarPerfiles,
    obtenerDashboardUrl,
    panelUrl,
    tienePerfil,
    // Fichas
    mayoristas: fichas.mayorista,
    minoristas: fichas.minorista,
    transportistas: fichas.transportista,
    compradores: fichas.comprador,
    loadingComercios,
    errorComercios,
    cargarComercios,
    isAdmin,
    tiposSinFicha,
    sinNingunPerfil,
  };

  return (
    <PerfilContext.Provider value={value}>
      {children}
    </PerfilContext.Provider>
  );
};

export default PerfilContext;
