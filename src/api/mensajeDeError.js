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
 * Sin respuesta (informe QA 30/09: el alta de comercio "volvía con estado 0")
 * axios solo trae "Network Error" o "timeout of …ms exceeded", que no le dicen
 * nada a quien usa la app. Pasa cuando no hay conexión, cuando el servidor no
 * contesta a tiempo o cuando responde un error interno sin cabeceras CORS (el
 * navegador lo bloquea y lo informa como estado 0).
 *
 * @param {Error} err - error de axios
 * @param {string} fallback - mensaje si no se puede extraer nada
 * @returns {string}
 */
export const MENSAJE_SIN_CONEXION = 'No hay conexión a internet. Revisá tu red y volvé a intentar.';
export const MENSAJE_TIMEOUT = 'El servidor tardó demasiado en responder. Probá de nuevo en unos minutos.';
export const MENSAJE_SIN_RESPUESTA =
  'No se pudo completar la operación porque el servidor no respondió correctamente. Puede ser un error interno: si se repite, avisanos.';

/** true si la petición salió pero no llegó ninguna respuesta legible (estado 0). */
export const esErrorSinRespuesta = (err) => Boolean(err?.request) && !err?.response;

const mensajeSinRespuesta = (err) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return MENSAJE_SIN_CONEXION;
  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') return MENSAJE_TIMEOUT;
  return MENSAJE_SIN_RESPUESTA;
};

const mensajeDeError = (err, fallback = 'Ocurrió un error inesperado') => {
  if (esErrorSinRespuesta(err)) return mensajeSinRespuesta(err);

  const data = err?.response?.data;
  const status = err?.response?.status;

  // Respuesta sin cuerpo JSON (p. ej. una página HTML de error 500)
  if (!data || typeof data !== 'object') {
    if (status >= 500) return `Error interno del servidor (${status}). Probá de nuevo más tarde.`;
    return err?.response ? fallback : err?.message || fallback;
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const primero = data.detail[0];
    const campo = Array.isArray(primero.loc) ? primero.loc[primero.loc.length - 1] : null;
    const msg = primero.msg?.replace(/^Value error,\s*/, '') || 'dato inválido';
    return campo ? `${campo}: ${msg}` : msg;
  }

  return data.error || data.detail || data.message || err?.message || fallback;
};

export default mensajeDeError;
