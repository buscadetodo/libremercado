// Datos de identidad y contacto del sitio (pie, páginas legales, títulos).
//
// PROVISORIO: el correo y la fecha son de relleno hasta que el equipo defina
// los definitivos. El dominio .example está reservado y no recibe correo, así
// que no se confunde con una dirección real. Se puede sobrescribir en el build
// con REACT_APP_CONTACTO_EMAIL.
export const NOMBRE_SITIO = 'BuscaDeTodoOnline';
export const CONTACTO_EMAIL =
  process.env.REACT_APP_CONTACTO_EMAIL || 'contacto@buscadetodo.example';
export const LEGALES_ACTUALIZADO = 'octubre de 2026';
export const LEGALES_PROVISORIOS = true;
