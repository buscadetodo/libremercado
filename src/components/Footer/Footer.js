import React from 'react';
import { Link } from 'react-router-dom';
import { NOMBRE_SITIO, CONTACTO_EMAIL } from '../../config/sitio';
import './Footer.css';

// Pie con privacidad, términos y contacto (informe QA 30/09).
// `variant="compact"` es para el layout con sidebar: menos aire y sin marca.
function Footer({ variant }) {
  const anio = new Date().getFullYear();

  return (
    <footer className={`site-footer ${variant === 'compact' ? 'site-footer-compact' : ''}`}>
      <div className="site-footer-inner">
        <p className="site-footer-copy">
          © {anio} {NOMBRE_SITIO}
        </p>
        <nav className="site-footer-links" aria-label="Información legal y contacto">
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Términos y condiciones</Link>
          <a href={`mailto:${CONTACTO_EMAIL}`}>Contacto</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
