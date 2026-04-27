import React, { createContext, useContext, useState, useEffect } from 'react';
import usuarioPerfilesService from '../services/usuarioPerfilesService';
import useAuth from '../hooks/useAuth';

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

  // Cargar perfiles del usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      cargarPerfiles();
    } else {
      setPerfiles([]);
      setPerfilActivo(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const cargarPerfiles = async () => {
    try {
      setLoading(true);
      const response = await usuarioPerfilesService.getByUserId(user.id);
      const perfilesUsuario = response.data || [];
      
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
  };

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

  const value = {
    perfiles,
    perfilActivo,
    loading,
    cambiarPerfil,
    cargarPerfiles,
    obtenerDashboardUrl,
    tienePerfil
  };

  return (
    <PerfilContext.Provider value={value}>
      {children}
    </PerfilContext.Provider>
  );
};

export default PerfilContext;
