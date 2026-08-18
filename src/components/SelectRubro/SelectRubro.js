import React, { useEffect } from 'react';
import { useRubros } from '../../hooks';
import './SelectRubro.css';

/**
 * Select de rubro, con el estado de la carga a la vista.
 *
 * Por qué existe: los tres formularios que piden rubro hacían
 * `{(rubros || []).map(...)}` y nada más. Si `GET /rubros/` fallaba (token
 * vencido, 500) o la tabla estaba vacía, el usuario veía exactamente lo mismo
 * en los dos casos: un select con una sola opción y ningún mensaje. Quedaba
 * trabado en un campo obligatorio sin saber por qué ni a quién reclamarle.
 *
 * Carga el catálogo por su cuenta: los formularios ya no tienen que llamar a
 * fetchRubros() ni pasarle la lista.
 *
 * @param {Object} props
 * @param {string|number} props.value - rubro_id seleccionado
 * @param {Function} props.onChange - handler del <select>
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {string} [props.className]
 * @param {boolean} [props.required]
 */
function SelectRubro({ value, onChange, id = 'rubro_id', name = 'rubro_id', className, required }) {
  const { rubros, loading, error, fetchRubros } = useRubros();

  useEffect(() => {
    fetchRubros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lista = Array.isArray(rubros) ? rubros : [];
  const vacio = !loading && !error && lista.length === 0;

  const textoPorDefecto = loading
    ? 'Cargando rubros...'
    : error
    ? 'No se pudieron cargar los rubros'
    : vacio
    ? 'No hay rubros cargados'
    : 'Seleccionar rubro...';

  return (
    <>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={loading || !!error || vacio}
        className={className}
      >
        <option value="">{textoPorDefecto}</option>
        {lista.map((r) => (
          <option key={r.id} value={r.id}>
            {r.rubro}
          </option>
        ))}
      </select>

      {error && (
        <span className="select-rubro-aviso error">
          ⚠️ {error}. Probá recargar la página; si sigue igual, puede haber vencido tu sesión.
        </span>
      )}

      {vacio && (
        <span className="select-rubro-aviso">
          ⚠️ Todavía no hay rubros cargados en el sistema. Pedile a un administrador que los dé
          de alta desde <strong>Rubros</strong> para poder completar este formulario.
        </span>
      )}
    </>
  );
}

export default SelectRubro;
