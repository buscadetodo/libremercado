import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { esAdmin } from '../config/roles';
import mayoristasService from '../services/mayoristasService';
import minoristasService from '../services/minoristasService';

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
 * @returns {{
 *   mayoristas: Array, minoristas: Array, opciones: Array,
 *   loading: boolean, error: string|null, isAdmin: boolean, reload: Function
 * }}
 */
export const useMisComercios = () => {
  const { user } = useAuth();
  const isAdmin = esAdmin(user);

  const [mayoristas, setMayoristas] = useState([]);
  const [minoristas, setMinoristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    // Sin usuario no hay nada que resolver.
    if (!user?.id) {
      setMayoristas([]);
      setMinoristas([]);
      return;
    }

    setLoading(true);
    setError(null);

    // El admin ve todos; el resto solo los propios (filtro id_usuario).
    const filtros = isAdmin ? { limit: 100 } : { id_usuario: user.id, limit: 100 };

    try {
      // allSettled: si un perfil no aplica al usuario, el otro igual se carga.
      const [mayResp, minResp] = await Promise.allSettled([
        mayoristasService.getAll(filtros),
        minoristasService.getAll(filtros),
      ]);

      const listar = (resp) => {
        if (resp.status !== 'fulfilled') return [];
        const data = resp.value?.data ?? resp.value;
        return Array.isArray(data) ? data : [];
      };

      setMayoristas(listar(mayResp));
      setMinoristas(listar(minResp));

      if (mayResp.status === 'rejected' && minResp.status === 'rejected') {
        setError('No se pudieron cargar tus comercios');
      }
    } catch (err) {
      setError('No se pudieron cargar tus comercios');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin]);

  useEffect(() => {
    reload();
  }, [reload]);

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

  return { mayoristas, minoristas, opciones, loading, error, isAdmin, reload };
};

export default useMisComercios;
