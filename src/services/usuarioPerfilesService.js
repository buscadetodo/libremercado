import httpClient from '../api/httpClient';

const usuarioPerfilesService = {
  /**
   * Obtener perfiles de un usuario
   * @param {number} idUsuario 
   * @returns {Promise}
   */
  getByUser: async (idUsuario) => {
    const response = await httpClient.get(`/usuario-perfiles/${idUsuario}`);
    return response.data;
  },

  /**
   * Asignar un perfil a un usuario
   * @param {number} idUsuario 
   * @param {number} idPerfil 
   * @returns {Promise}
   */
  assign: async (idUsuario, idPerfil) => {
    const response = await httpClient.post('/usuario-perfiles/', {
      id_usuario: idUsuario,
      id_perfil: idPerfil,
    });
    return response.data;
  },

  /**
   * Desasignar un perfil de un usuario
   * @param {number} idUsuario 
   * @param {number} idPerfil 
   * @returns {Promise}
   */
  unassign: async (idUsuario, idPerfil) => {
    const response = await httpClient.delete('/usuario-perfiles/', {
      data: {
        id_usuario: idUsuario,
        id_perfil: idPerfil,
      },
    });
    return response.data;
  },

  /**
   * Reemplazar todos los perfiles de un usuario
   * @param {number} idUsuario 
   * @param {string} idsPerfilCsv - IDs separados por coma, ej: "1,2,3"
   * @returns {Promise}
   */
  replace: async (idUsuario, idsPerfilCsv) => {
    const response = await httpClient.put('/usuario-perfiles/reemplazar', {
      id_usuario: idUsuario,
      ids_perfil: idsPerfilCsv,
    });
    return response.data;
  },
};

export default usuarioPerfilesService;
