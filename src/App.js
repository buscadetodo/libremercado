import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Toast Provider
import { ToastProvider } from './components/Toast/Toast';

// Context
import { PerfilProvider } from './context/PerfilContext';

// Layout
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Auth Mejorada
import RegisterUniversal from './pages/Auth/RegisterUniversal';
import SeleccionTipoCuenta from './pages/Auth/SeleccionTipoCuenta';
import RegisterDinamico from './pages/Auth/RegisterDinamico';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Dashboards Específicos
import MayoristaDashboard from './pages/Dashboards/MayoristaDashboard';
import MinoristaDashboard from './pages/Dashboards/MinoristaDashboard';
import CompradorHome from './pages/Dashboards/CompradorHome';
import TransportistaDashboard from './pages/Dashboards/TransportistaDashboard';

// Mayoristas
import MayoristasList from './pages/Mayoristas/MayoristasList';
import MayoristaForm from './pages/Mayoristas/MayoristaForm';

// Minoristas
import MinoristasList from './pages/Minoristas/MinoristasList';
import MinoristaForm from './pages/Minoristas/MinoristaForm';

// Transportistas
import TransportistasList from './pages/Transportistas/TransportistasList';
import TransportistaForm from './pages/Transportistas/TransportistaForm';

// Compradores
import CompradoresList from './pages/Compradores/CompradoresList';
import CompradorForm from './pages/Compradores/CompradorForm';

// Productos
import ProductosList from './pages/Productos/ProductosList';
import ProductoForm from './pages/Productos/ProductoForm';

// Admin
import RubrosList from './pages/Admin/RubrosList';
import UsuariosList from './pages/Admin/UsuariosList';

// Perfil
import Perfil from './pages/Perfil/Perfil';
import AgregarPerfil from './pages/Perfil/AgregarPerfil';

// 404
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <ToastProvider>
      <PerfilProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          
          {/* Auth - Sistema nuevo (Universal) */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegisterUniversal />} />
          
          {/* Auth - Sistema antiguo (deprecated - mantener por compatibilidad) */}
          <Route path="/login-old" element={<Login />} />
          <Route path="/registro-old" element={<Register />} />
          <Route path="/registro-tipos" element={<SeleccionTipoCuenta />} />
          <Route path="/registro/:tipo" element={<RegisterDinamico />} />

        {/* Dashboards Específicos por Perfil */}
        <Route
          path="/mayorista/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <MayoristaDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/minorista/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <MinoristaDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/comprador/home"
          element={
            <PrivateRoute>
              <Layout>
                <CompradorHome />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transportista/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <TransportistaDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Dashboard Administrativo */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/mayoristas/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<MayoristasList />} />
                  <Route path="/nuevo" element={<MayoristaForm />} />
                  <Route path="/:id/editar" element={<MayoristaForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/minoristas/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<MinoristasList />} />
                  <Route path="/nuevo" element={<MinoristaForm />} />
                  <Route path="/:id/editar" element={<MinoristaForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transportistas/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<TransportistasList />} />
                  <Route path="/nuevo" element={<TransportistaForm />} />
                  <Route path="/:id/editar" element={<TransportistaForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/compradores/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<CompradoresList />} />
                  <Route path="/nuevo" element={<CompradorForm />} />
                  <Route path="/:id/editar" element={<CompradorForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/productos/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<ProductosList />} />
                  <Route path="/nuevo" element={<ProductoForm />} />
                  <Route path="/:id/editar" element={<ProductoForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/rubros/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<RubrosList />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<UsuariosList />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Perfil />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Agregar Perfil */}
        <Route
          path="/agregar-perfil"
          element={
            <PrivateRoute>
              <Layout>
                <AgregarPerfil />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </PerfilProvider>
    </ToastProvider>
  );
}

export default App;
