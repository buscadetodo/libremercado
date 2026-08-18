// Flags de funcionalidades.
// Permiten activar/desactivar secciones sin borrar código.
//
// FEATURE_PRODUCTOS: el backend ya expone el CRUD de /productos/
// (GET/POST/PUT/DELETE, con filtros mayorista_id, minorista_id, rubro_id,
// search, limit, offset). La sección está integrada contra ese contrato.
// Se deja el flag para poder apagarla rápido si el recurso se cae en un ambiente.
export const FEATURE_PRODUCTOS = true;
