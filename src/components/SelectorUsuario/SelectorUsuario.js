import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks';
import { esAdmin } from '../../config/roles';
import usersService from '../../services/usersService';

/**
 * Selector del usuario dueño de un comercio / perfil.
 *
 * Por qué existe: los formularios de mayorista, minorista, transportista y
 * comprador tenían `id_usuario: 1` fijo en el estado inicial, sin ningún campo
 * en pantalla. Resultado: todo lo que se creaba desde esas pantallas quedaba
 * a nombre del usuario 1 en lugar del que correspondía.
 *
 * Comportamiento:
 *  - Administrador: puede elegir a qué usuario pertenece el registro.
 *  - Resto: el registro se crea siempre a nombre del usuario logueado.
 *
 * En edición no se autoasigna nada: se respeta el dueño que ya tenía el
 * registro (cambiarlo es una operación aparte, y solo el admin puede).
 *
 * @param {Object} props
 * @param {number|string} props.value - id_usuario actual
 * @param {Function} props.onChange - recibe el nuevo id_usuario (number)
 * @param {boolean} [props.isEdit] - true si se está editando un registro existente
 */
function SelectorUsuario({ value, onChange, isEdit = false }) {
  const { user } = useAuth();
  const isAdmin = esAdmin(user);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);

  // En un alta sin dueño definido, el dueño es quien está logueado.
  useEffect(() => {
    if (isEdit) return;
    if (value) return;
    if (!user?.id) return;
    onChange(Number(user.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, value, user?.id]);

  // La lista de usuarios solo le sirve (y solo le responde) al admin.
  useEffect(() => {
    if (!isAdmin) return;

    let cancelado = false;

    const cargar = async () => {
      try {
        const resp = await usersService.getAll({ limit: 100 });
        const lista = resp?.data ?? resp ?? [];
        if (!cancelado) setUsuarios(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        if (!cancelado) setError('No se pudo cargar la lista de usuarios.');
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [isAdmin]);

  const etiqueta = (u) => {
    const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ').trim();
    return nombre ? `${nombre} — ${u.email}` : u.email || `Usuario #${u.id}`;
  };

  if (!isAdmin) {
    return (
      <div className="form-group">
        <label>Usuario</label>
        <p className="form-hint">
          Se registrará a nombre de tu usuario{user?.email ? ` (${user.email})` : ''}.
        </p>
      </div>
    );
  }

  // El registro puede pertenecer a un usuario que no entró en los primeros 100.
  const valorFueraDeLista =
    value && !usuarios.some((u) => String(u.id) === String(value));

  return (
    <div className="form-group">
      <label htmlFor="id_usuario">Usuario dueño *</label>
      <select
        id="id_usuario"
        name="id_usuario"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        required
        className="form-input"
      >
        <option value="">Selecciona un usuario</option>
        {valorFueraDeLista && (
          <option value={value}>Usuario #{value}</option>
        )}
        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>
            {etiqueta(u)}
          </option>
        ))}
      </select>
      {error ? (
        <small className="form-hint">{error}</small>
      ) : (
        <small className="form-hint">
          Como administrador podés registrarlo a nombre de otro usuario.
        </small>
      )}
    </div>
  );
}

export default SelectorUsuario;
