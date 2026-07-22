// La lógica de autenticación vive ahora en un contexto compartido
// (context/AuthContext) para que el estado de sesión sea único y reactivo.
// Este archivo se mantiene por retrocompatibilidad de imports:
//   import useAuth from '../hooks/useAuth'   (default)
//   import { useAuth } from '../hooks'        (named, vía hooks/index.js)
import { useAuth } from '../context/AuthContext';

export default useAuth;
