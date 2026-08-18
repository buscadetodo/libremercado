import React from 'react';
import { Link } from 'react-router-dom';
import { useFichaComercial } from '../../hooks';
import './AvisoFichaComercial.css';

/**
 * Aviso para el comerciante que tiene el perfil asignado pero todavía no cargó
 * su ficha comercial (razón social, CUIT, rubro y horarios).
 *
 * Sin ese registro la API rechaza cualquier alta de producto, así que el
 * dashboard no puede ofrecer "Nuevo Producto" como si nada: primero hay que
 * decirle qué le falta y llevarlo al alta.
 *
 * No renderiza nada si la ficha existe, si el alta no le corresponde
 * (comprador, transportista, administrador) o mientras se está cargando.
 *
 * @param {Object} props
 * @param {'mayorista'|'minorista'} [props.tipo] - limita el aviso a ese tipo
 */
function AvisoFichaComercial({ tipo }) {
  const { tiposFaltantes, loading } = useFichaComercial();

  if (loading) return null;

  const faltantes = tipo
    ? tiposFaltantes.filter((t) => t === tipo)
    : tiposFaltantes;

  if (faltantes.length === 0) return null;

  const nombres = faltantes.join(' ni de ');

  return (
    <div className="aviso-ficha">
      <span className="aviso-ficha-icono">⚠️</span>
      <div className="aviso-ficha-texto">
        <h3>Te falta dar de alta tu comercio</h3>
        <p>
          Tenés el perfil de <strong>{nombres}</strong>, pero todavía no cargaste la
          ficha comercial (razón social, CUIT, rubro y horarios de atención).
          Hasta que exista, no vas a poder publicar productos.
        </p>
        <Link to="/agregar-perfil" className="aviso-ficha-btn">
          Dar de alta mi comercio
        </Link>
      </div>
    </div>
  );
}

export default AvisoFichaComercial;
