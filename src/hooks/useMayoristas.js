import { useEffect } from 'react';
import useApi from './useApi';
import mayoristasService from '../services/mayoristasService';

/**
 * Hook para gestionar mayoristas
 */
export const useMayoristas = () => {
  const { 
    data, 
    loading, 
    error, 
    execute: fetchMayoristas,
    reset 
  } = useApi(mayoristasService.getAll);

  const { execute: fetchMayoristaById } = useApi(mayoristasService.getById);
  const { execute: createMayorista } = useApi(mayoristasService.create);
  const { execute: updateMayorista } = useApi(mayoristasService.update);
  const { execute: deleteMayorista } = useApi(mayoristasService.delete);

  // Extraer el array de mayoristas correctamente
  const mayoristas = data?.data || data || null;

  return {
    mayoristas,
    loading,
    error,
    fetchMayoristas,
    fetchMayoristaById,
    createMayorista,
    updateMayorista,
    deleteMayorista,
    reset,
  };
};

/**
 * Hook para obtener mayoristas con filtros automáticamente
 */
export const useMayoristasAutoload = (filters = {}) => {
  const hook = useMayoristas();

  useEffect(() => {
    hook.fetchMayoristas(filters);
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  return hook;
};
