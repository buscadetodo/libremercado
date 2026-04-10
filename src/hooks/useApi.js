import { useState, useCallback } from 'react';

/**
 * Hook genérico para llamadas a la API con manejo de loading y errores
 * @param {Function} serviceFunction - función del servicio a ejecutar
 * @returns {Object} - { data, loading, error, execute, reset }
 */
const useApi = (serviceFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await serviceFunction(...params);
        setData(result);
        
        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.detail || 
                           err.message || 
                           'Ocurrió un error inesperado';
        
        setError(errorMessage);
        
        return { 
          success: false, 
          error: errorMessage,
          status: err.response?.status,
        };
      } finally {
        setLoading(false);
      }
    },
    [serviceFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
