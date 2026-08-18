/**
 * Traduce un error de axios al mensaje que corresponde mostrar.
 *
 * La API mezcla dos formatos (confirmado contra la colección del backend):
 *  - Errores de negocio  → { success: false, error: "Mayorista no encontrado" }
 *  - Errores de FastAPI  → { detail: "Not authenticated" }  (401)
 *                        → { detail: [ { loc, msg, type } ] } (422 validación)
 *
 * El 422 es el caso que más ensucia: `detail` es un ARRAY de objetos, así que
 * mostrarlo tal cual termina en "[object Object]".
 *
 * @param {Error} err - error de axios
 * @param {string} fallback - mensaje si no se puede extraer nada
 * @returns {string}
 */
const mensajeDeError = (err, fallback = 'Ocurrió un error inesperado') => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const primero = data.detail[0];
    const campo = Array.isArray(primero.loc) ? primero.loc[primero.loc.length - 1] : null;
    const msg = primero.msg?.replace(/^Value error,\s*/, '') || 'dato inválido';
    return campo ? `${campo}: ${msg}` : msg;
  }

  return data.error || data.detail || data.message || err?.message || fallback;
};

export default mensajeDeError;
