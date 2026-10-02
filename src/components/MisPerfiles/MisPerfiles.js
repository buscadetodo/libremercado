import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePerfilActivo } from '../../context/PerfilContext';
import { useToast } from '../Toast/Toast';
import Icon from '../Icon/Icon';
import './MisPerfiles.css';

const ICONOS = {
  mayorista: 'mayorista',
  minorista: 'minorista',
  comprador: 'comprador',
  transportista: 'transportista',
};

/**
 * Perfiles del usuario, con la opción de sumar otro o darlo de baja.
 *
 * Por qué existe: hasta ahora los perfiles solo se podían agregar. Si alguien
 * se sumaba un perfil por error quedaba para siempre, aunque la API expone la
 * baja (DELETE /usuario-perfiles/).
 *
 * La baja desasigna el perfil pero NO borra la ficha del recurso (el mayorista,
 * el transportista): la API no tiene baja en cascada, así que el registro queda
 * y el perfil se puede volver a asignar más tarde sin cargar todo de nuevo.
 * Eso se le avisa al usuario antes de confirmar.
 */
function MisPerfiles() {
  const { perfiles, perfilActivo, loading, quitarPerfil, tiposSinFicha } = usePerfilActivo();
  const toast = useToast();
  const [quitando, setQuitando] = useState(null);

  if (loading) {
    return (
      <div className="mis-perfiles">
        <h3>Mis perfiles</h3>
        <p className="mis-perfiles-vacio"><Icon name="loading" /> Cargando perfiles...</p>
      </div>
    );
  }

  const handleQuitar = async (perfil) => {
    const nombre = perfil.perfil;
    const confirmado = window.confirm(
      `¿Quitar el perfil de ${nombre}?\n\n` +
        'Vas a dejar de ver su panel. Los datos que hayas cargado ' +
        `(tu ficha de ${nombre}) no se borran, así que si volvés a sumarlo más ` +
        'adelante siguen estando.'
    );
    if (!confirmado) return;

    setQuitando(perfil.id_perfil);
    const resultado = await quitarPerfil(perfil.id_perfil);
    setQuitando(null);

    if (resultado.success) {
      toast.success(`Perfil de ${nombre} quitado`);
    } else {
      toast.error(resultado.error);
    }
  };

  return (
    <div className="mis-perfiles">
      <h3>Mis perfiles</h3>

      {perfiles.length === 0 ? (
        <p className="mis-perfiles-vacio">
          Todavía no elegiste ningún perfil, así que no podés operar en la app.{' '}
          <Link to="/agregar-perfil">Elegí uno ahora</Link>.
        </p>
      ) : (
        <ul className="mis-perfiles-lista">
          {perfiles.map((p) => {
            const nombre = p.perfil?.toLowerCase();
            const incompleto = tiposSinFicha.includes(nombre);
            const esActivo = perfilActivo?.id_perfil === p.id_perfil;

            return (
              <li key={p.id_perfil} className="mis-perfiles-item">
                <span className="mis-perfiles-icono"><Icon name={ICONOS[nombre] || 'user'} /></span>
                <div className="mis-perfiles-datos">
                  <span className="mis-perfiles-nombre">{p.perfil}</span>
                  {esActivo && <span className="mis-perfiles-tag activo">activo</span>}
                  {incompleto && (
                    <span className="mis-perfiles-tag incompleto">datos incompletos</span>
                  )}
                </div>
                <button
                  type="button"
                  className="mis-perfiles-quitar"
                  onClick={() => handleQuitar(p)}
                  disabled={quitando === p.id_perfil}
                >
                  {quitando === p.id_perfil ? 'Quitando...' : 'Quitar'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/agregar-perfil" className="mis-perfiles-agregar">
        <Icon name="add" /> Agregar otro perfil
      </Link>
    </div>
  );
}

export default MisPerfiles;
