import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NOMBRE_SITIO } from '../config/sitio';

// Título de la pestaña según la sección (informe QA 30/09: era siempre
// "BuscaDeTodoOnline"). Se evalúa en orden y gana el primer prefijo que coincide.
const TITULOS = [
  ['/login', 'Iniciar sesión'],
  ['/registro', 'Crear cuenta'],
  ['/privacidad', 'Política de privacidad'],
  ['/terminos', 'Términos y condiciones'],
  ['/mayorista/dashboard', 'Panel mayorista'],
  ['/minorista/dashboard', 'Panel minorista'],
  ['/comprador/home', 'Panel comprador'],
  ['/transportista/dashboard', 'Panel transportista'],
  ['/dashboard', 'Administración'],
  ['/mayoristas', 'Mayoristas'],
  ['/minoristas', 'Minoristas'],
  ['/transportistas', 'Transportistas'],
  ['/compradores', 'Compradores'],
  ['/productos', 'Productos'],
  ['/rubros', 'Rubros'],
  ['/usuarios', 'Usuarios'],
  ['/perfil', 'Mi perfil'],
  ['/agregar-perfil', 'Elegir perfil'],
];

const TITULO_HOME = `${NOMBRE_SITIO} | Marketplace mayorista`;

function TituloPorRuta() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/') {
      document.title = TITULO_HOME;
      return;
    }
    const encontrado = TITULOS.find(
      ([prefijo]) => pathname === prefijo || pathname.startsWith(`${prefijo}/`) || pathname.startsWith(`${prefijo}-`)
    );
    document.title = encontrado
      ? `${encontrado[1]} | ${NOMBRE_SITIO}`
      : `Página no encontrada | ${NOMBRE_SITIO}`;
  }, [pathname]);

  return null;
}

export default TituloPorRuta;
