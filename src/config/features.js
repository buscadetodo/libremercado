// Flags de funcionalidades.
// Permiten activar/desactivar secciones sin borrar código.
//
// FEATURE_PRODUCTOS: el backend todavía NO expone el recurso /productos/
// (GET /productos/ devuelve 404). Mientras esté en false, se ocultan los
// accesos a Productos para evitar pantallas rotas. Cuando el backend agregue
// los endpoints, poner en true y toda la sección vuelve a aparecer.
export const FEATURE_PRODUCTOS = false;
