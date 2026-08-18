import React from 'react';
import { Link } from 'react-router-dom';
import { useFichaComercial } from '../../hooks';
import './AvisoFichaComercial.css';

/**
 * Aviso para el usuario que tiene el perfil asignado pero todavía no cargó la
 * ficha del recurso (el mayorista, el minorista, el transportista…).
 *
 * Sin ese registro la API lo trata como si no existiera: el mayorista no puede
 * publicar productos y el transportista no figura como disponible. El dashboard
 * no puede seguir como si nada: primero hay que decirle qué le falta y llevarlo
 * al alta.
 *
 * No renderiza nada si la ficha existe, si el alta no le corresponde
 * (administrador) o mientras se está cargando.
 *
 * @param {Object} props
 * @param {'mayorista'|'minorista'|'transportista'|'comprador'} [props.tipo]
 *   limita el aviso a ese tipo; sin él, avisa por cualquiera que falte
 */

const TEXTOS = {
  mayorista: {
    titulo: 'Te falta dar de alta tu comercio',
    datos: 'la ficha comercial (razón social, CUIT, rubro y horarios de atención)',
    consecuencia: 'Hasta que exista, no vas a poder publicar productos.',
    boton: 'Dar de alta mi comercio',
  },
  minorista: {
    titulo: 'Te falta dar de alta tu comercio',
    datos: 'la ficha comercial (razón social, CUIT, rubro y horarios de atención)',
    consecuencia: 'Hasta que exista, no vas a poder publicar productos.',
    boton: 'Dar de alta mi comercio',
  },
  transportista: {
    titulo: 'Te faltan los datos de tu servicio',
    datos: 'los datos del transporte (vehículo, patente, capacidad y precios)',
    consecuencia: 'Hasta que existan, no vas a figurar como transportista disponible.',
    boton: 'Completar mis datos',
  },
  comprador: {
    titulo: 'Te falta completar tu alta',
    datos: 'tus datos de comprador',
    consecuencia: 'Conviene completarlo para que tus pedidos queden asociados a vos.',
    boton: 'Completar mis datos',
  },
};

function AvisoFichaComercial({ tipo }) {
  const { tiposFaltantes, loading } = useFichaComercial();

  if (loading) return null;

  const faltantes = tipo ? tiposFaltantes.filter((t) => t === tipo) : tiposFaltantes;
  if (faltantes.length === 0) return null;

  // Con varios faltantes se usa el texto del primero: el botón lleva al mismo
  // lugar y ahí se ven todos los pendientes.
  const texto = TEXTOS[faltantes[0]] || TEXTOS.mayorista;
  const nombres = faltantes.join(' ni de ');

  return (
    <div className="aviso-ficha">
      <span className="aviso-ficha-icono">⚠️</span>
      <div className="aviso-ficha-texto">
        <h3>{texto.titulo}</h3>
        <p>
          Tenés el perfil de <strong>{nombres}</strong>, pero todavía no cargaste{' '}
          {texto.datos}. {texto.consecuencia}
        </p>
        <Link to="/agregar-perfil" className="aviso-ficha-btn">
          {texto.boton}
        </Link>
      </div>
    </div>
  );
}

export default AvisoFichaComercial;
