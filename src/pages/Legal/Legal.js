import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import Footer from '../../components/Footer/Footer';
import {
  NOMBRE_SITIO,
  CONTACTO_EMAIL,
  LEGALES_ACTUALIZADO,
  LEGALES_PROVISORIOS,
} from '../../config/sitio';
import './Legal.css';

// Marco común de las páginas legales: encabezado con vuelta al inicio,
// aviso de texto provisorio y pie.
function PaginaLegal({ titulo, children }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="legal-brand">
          <Icon name="minorista" /> {NOMBRE_SITIO}
        </Link>
      </header>

      <main className="legal-main">
        <article className="legal-card">
          <h1>{titulo}</h1>
          <p className="legal-fecha">Última actualización: {LEGALES_ACTUALIZADO}</p>

          {LEGALES_PROVISORIOS && (
            <div className="legal-aviso" role="note">
              <Icon name="warning" />
              <span>
                Texto provisorio. Está pendiente de revisión legal y puede cambiar antes
                de la publicación definitiva del sitio.
              </span>
            </div>
          )}

          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}

const MailContacto = () => <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>;

export function Privacidad() {
  return (
    <PaginaLegal titulo="Política de privacidad">
      <p>
        En {NOMBRE_SITIO} cuidamos los datos de las personas y comercios que usan la
        plataforma. Esta política explica qué datos pedimos, para qué los usamos y qué
        derechos tenés sobre ellos.
      </p>

      <h2>Qué datos recopilamos</h2>
      <ul>
        <li>
          <strong>Datos de la cuenta:</strong> nombre, apellido, DNI, email y contraseña
          (la contraseña se guarda cifrada).
        </li>
        <li>
          <strong>Datos del comercio</strong> (mayoristas y minoristas): razón social, CUIT,
          rubro, horarios y condiciones de venta.
        </li>
        <li>
          <strong>Datos del transportista:</strong> tipo de vehículo, patente, capacidad de
          carga y tarifas.
        </li>
        <li>
          <strong>Ubicación:</strong> solo si usás “Detectar ubicación” y das permiso en el
          navegador. Se usa para estimar tu código postal y mostrarte comercios cercanos.
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Crear y administrar tu cuenta y tus perfiles.</li>
        <li>Mostrar tu comercio o tu servicio de flete a otros usuarios de la plataforma.</li>
        <li>Conectar a compradores, comercios y transportistas de la misma zona.</li>
        <li>Mantener la seguridad del sitio y prevenir usos indebidos.</li>
      </ul>

      <h2>Con quién los compartimos</h2>
      <p>
        No vendemos tus datos. Los datos públicos de un comercio o transportista (nombre
        comercial, rubro, zona) se muestran a otros usuarios registrados. Para convertir
        la ubicación en código postal se consulta un servicio de mapas externo.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés pedir acceso, corrección o eliminación de tus datos en cualquier momento.
        Desde <Link to="/perfil">Mi Perfil</Link> podés editar tus datos y dar de baja un
        perfil. Para cualquier otra solicitud, escribinos a <MailContacto />.
      </p>
      <p>
        En Argentina, la Agencia de Acceso a la Información Pública es el órgano de
        control de la Ley 25.326 de Protección de Datos Personales.
      </p>

      <h2>Contacto</h2>
      <p>
        Por consultas sobre esta política: <MailContacto />.
      </p>
    </PaginaLegal>
  );
}

export function Terminos() {
  return (
    <PaginaLegal titulo="Términos y condiciones">
      <p>
        Estos términos regulan el uso de {NOMBRE_SITIO}, una plataforma que conecta a
        mayoristas, minoristas, compradores y transportistas. Al crear una cuenta, aceptás
        estas condiciones.
      </p>

      <h2>La cuenta</h2>
      <ul>
        <li>Los datos que cargás tienen que ser reales y estar actualizados.</li>
        <li>Sos responsable de mantener tu contraseña en reserva.</li>
        <li>Podés tener más de un perfil (por ejemplo, comprador y minorista).</li>
      </ul>

      <h2>Publicaciones y operaciones</h2>
      <ul>
        <li>
          Cada comercio es responsable de los productos, precios, stock y condiciones que
          publica.
        </li>
        <li>
          Los acuerdos de compra y de flete se hacen entre las partes. {NOMBRE_SITIO}{' '}
          facilita el contacto, pero no es parte de esas operaciones.
        </li>
        <li>No se permite publicar contenido falso, ilegal u ofensivo.</li>
      </ul>

      <h2>Uso del sitio</h2>
      <p>
        No está permitido intentar acceder a datos de otras cuentas, interferir con el
        funcionamiento del sitio o usarlo para enviar publicidad no solicitada. Podemos
        suspender cuentas que no cumplan estas condiciones.
      </p>

      <h2>Cambios</h2>
      <p>
        Podemos actualizar estos términos. Si el cambio es importante, lo vamos a avisar en
        el sitio antes de que entre en vigencia.
      </p>

      <h2>Contacto</h2>
      <p>
        Por consultas sobre estos términos: <MailContacto />.
      </p>
    </PaginaLegal>
  );
}
