import { useEffect } from 'react';
import useApi from './useApi';
import rubrosService from '../services/rubrosService';

/**
 * Hook para gestionar rubros
 */
export const useRubros = () => {
  const { 
    data, 
    loading, 
    error, 
    execute: fetchRubros,
    reset 
  } = useApi(rubrosService.getAll);

  const { execute: fetchRubroById } = useApi(rubrosService.getById);
  const { execute: createRubro } = useApi(rubrosService.create);
  const { execute: updateRubro } = useApi(rubrosService.update);
  const { execute: deleteRubro } = useApi(rubrosService.delete);

  // Extraer el array de rubros correctamente
  const rubros = data?.data || data || null;

  return {
    rubros,
    loading,
    error,
    fetchRubros,
    fetchRubroById,
    createRubro,
    updateRubro,
    deleteRubro,
    reset,
  };
};

/**
 * Hook para obtener rubros automáticamente al montar
 */
export const useRubrosAutoload = (limit, offset) => {
  const hook = useRubros();

  useEffect(() => {
    hook.fetchRubros(limit, offset);
  }, [limit, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  return hook;
};
