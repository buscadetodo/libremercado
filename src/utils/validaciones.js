// Validaciones de formato compartidas por los formularios.
//
// Informe QA 30/09: el email aceptaba casi cualquier texto (a'OR'1'='1@a.com)
// y la patente aceptaba HTML. Se sigue el modelo del DNI: se limpia mientras
// se escribe y se valida el formato al enviar.

// Usuario con letras, números y . _ % + -; dominio con al menos un punto y una
// terminación de 2 o más letras (ej.: nombre.apellido@empresa.com.ar).
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export const esEmailValido = (email) => EMAIL_REGEX.test(String(email || '').trim());

// Patentes argentinas: formato viejo ABC123 y Mercosur AB123CD.
const PATENTE_REGEX = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

export const PATENTE_MAX = 7;
export const PATENTE_AYUDA = 'Formato ABC123 o AB123CD';

/** Para el onChange: mayúsculas, sin espacios, guiones ni símbolos, hasta 7. */
export const normalizarPatente = (valor) =>
  String(valor || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, PATENTE_MAX);

export const esPatenteValida = (patente) => PATENTE_REGEX.test(normalizarPatente(patente));
