import { usePerfilActivo } from '../context/PerfilContext';

/**
 * Comercios (mayoristas / minoristas) sobre los que el usuario logueado puede operar.
 *
 * Por qué existe: la API exige que el mayorista_id / minorista_id de un producto
 * pertenezca al usuario del token; si no, responde 403 "No autorizado para este
 * mayorista". Antes el formulario listaba TODOS los mayoristas, así que era muy
 * fácil elegir uno ajeno y comerse el 403 sin entender por qué.
 *
 * El administrador es la excepción: ve el catálogo completo de comercios.
 *
 * Los datos se cargan una sola vez en PerfilContext (los consultan el Sidebar,
 * los dashboards y los formularios); este hook solo los adapta al formato que
 * usan los componentes.
 *
 * @returns {{
 *   mayoristas: Array, minoristas: Array, opciones: Array,
 *   loading: boolean, error: string|null, isAdmin: boolean, reload: Function
 * }}
 */
export const useMisComercios = () => {
  const {
    mayoristas,
    minoristas,
    loadingComercios,
    errorComercios,
    cargarComercios,
    isAdmin,
  } = usePerfilActivo();

  // Lista plana lista para un <select>, con el tipo de oferente incluido.
  const opciones = [
    ...mayoristas.map((m) => ({
      tipo: 'mayorista',
      id: m.id,
      label: m.razon_social || `Mayorista #${m.id}`,
    })),
    ...minoristas.map((m) => ({
      tipo: 'minorista',
      id: m.id,
      label: m.razon_social || `Minorista #${m.id}`,
    })),
  ];

  return {
    mayoristas,
    minoristas,
    opciones,
    loading: loadingComercios,
    error: errorComercios,
    isAdmin,
    reload: cargarComercios,
  };
};

export default useMisComercios;
