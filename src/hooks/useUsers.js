import { useEffect } from 'react';
import useApi from './useApi';
import usersService from '../services/usersService';

/**
 * Hook para gestionar usuarios
 */
export const useUsers = () => {
  const { 
    data, 
    loading, 
    error, 
    execute: fetchUsers,
    reset 
  } = useApi(usersService.getAll);

  const { execute: fetchUserById } = useApi(usersService.getById);
  const { execute: registerUser } = useApi(usersService.register);
  const { execute: updateUser } = useApi(usersService.update);
  const { execute: deleteUser } = useApi(usersService.delete);

  // Extraer el array de usuarios correctamente
  const users = data?.data || data || null;

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    registerUser,
    updateUser,
    deleteUser,
    reset,
  };
};

/**
 * Hook para obtener usuarios con filtros automáticamente
 */
export const useUsersAutoload = (filters = {}) => {
  const hook = useUsers();

  useEffect(() => {
    hook.fetchUsers(filters);
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  return hook;
};
