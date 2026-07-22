// IDs de roles reales de la API (confirmados contra el backend dev).
// GET /roles/ → [{ id: 1, rol: "administrador" }, { id: 2, rol: "usuario" }]
export const ROL_ADMIN = 1;
export const ROL_USUARIO = 2;

// IDs de perfiles reales (GET /perfiles/):
// 1=mayorista, 2=minorista, 3=transportista, 4=comprador
export const PERFIL = {
  MAYORISTA: 1,
  MINORISTA: 2,
  TRANSPORTISTA: 3,
  COMPRADOR: 4,
};

/**
 * @param {{id_rol?: number}|null} user
 * @returns {boolean}
 */
export const esAdmin = (user) => user?.id_rol === ROL_ADMIN;
