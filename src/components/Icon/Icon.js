import React from 'react';
import {
  Apple,
  Candy,
  Car,
  ChartColumn,
  CircleCheck,
  CircleX,
  ClipboardList,
  Container,
  Croissant,
  CupSoda,
  Droplet,
  Eye,
  Factory,
  FileText,
  Flame,
  FolderOpen,
  Folders,
  Heart,
  House,
  Laptop,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Snowflake,
  Sparkles,
  SprayCan,
  Store,
  Trash2,
  TriangleAlert,
  Truck,
  User,
  Users,
  Van,
  Wallet,
  Warehouse,
  Wheat,
  X,
} from 'lucide-react';
import './Icon.css';

/**
 * Íconos de la interfaz (informe QA 30/09: los emoji se veían como cuadrados
 * vacíos en navegadores sin fuente de emoji). Son SVG, así que se ven igual en
 * todos lados.
 *
 * Este mapa es el único lugar que conoce la librería: para cambiar un ícono
 * (o pasar a un set propio del sistema de diseño) se toca solo acá.
 */
const ICONOS = {
  // Estados y avisos
  warning: TriangleAlert,
  error: CircleX,
  success: CircleCheck,
  loading: LoaderCircle,

  // Acciones
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  save: Save,
  search: Search,
  close: X,
  menu: Menu,
  refresh: RefreshCw,
  logout: LogOut,
  view: Eye,

  // Perfiles y comercios
  mayorista: Factory,
  minorista: Store,
  comprador: ShoppingBag,
  transportista: Truck,
  local: Warehouse,
  user: User,
  users: Users,

  // Navegación y secciones
  home: House,
  dashboard: LayoutDashboard,
  chart: ChartColumn,
  settings: Settings,
  folder: FolderOpen,
  folders: Folders,
  note: FileText,
  list: ClipboardList,
  package: Package,
  cart: ShoppingCart,
  receipt: Receipt,
  money: Wallet,
  heart: Heart,
  sparkles: Sparkles,
  rocket: Rocket,
  hot: Flame,

  // Datos de contacto y ubicación
  location: MapPin,
  mail: Mail,
  phone: Phone,
  lock: Lock,

  // Vehículos
  car: Car,
  van: Van,
  heavyTruck: Container,
  cold: Snowflake,

  // Rubros
  alimentos: Apple,
  bebidas: CupSoda,
  limpieza: SprayCan,
  mascotas: PawPrint,
  electronica: Laptop,
  granos: Wheat,
  aceites: Droplet,
  golosinas: Candy,
  panificados: Croissant,
};

/**
 * @param {string} name   clave de ICONOS
 * @param {string} label  si el ícono transmite información por sí solo (no hay
 *                        texto al lado), el texto que lee el lector de pantalla.
 *                        Sin label el ícono es decorativo y queda oculto.
 * @param size            por defecto 1em: toma el font-size del contenedor, así
 *                        las clases que antes dimensionaban el emoji siguen andando.
 */
function Icon({ name, label, size = '1em', className = '', ...rest }) {
  const Componente = ICONOS[name];
  if (!Componente) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Icon: no existe el ícono "${name}"`);
    }
    return null;
  }

  const clases = ['icon', name === 'loading' ? 'icon-spin' : '', className]
    .filter(Boolean)
    .join(' ');

  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true, focusable: false };

  return <Componente size={size} className={clases} {...a11y} {...rest} />;
}

export default Icon;
