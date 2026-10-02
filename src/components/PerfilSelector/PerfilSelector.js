import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfilActivo } from '../../context/PerfilContext';
import Icon from '../Icon/Icon';
import './PerfilSelector.css';

function PerfilSelector() {
  const navigate = useNavigate();
  const { perfiles, perfilActivo, cambiarPerfil, obtenerDashboardUrl } = usePerfilActivo();
  const [showDropdown, setShowDropdown] = useState(false);

  // Sin perfiles no hay nada que seleccionar, pero devolver null dejaba al
  // usuario recién registrado sin ningún acceso a la pantalla de alta: el
  // registro le crea la cuenta y, si abandona el onboarding, no hay forma de
  // volver salvo escribir la URL. Se muestra el acceso en lugar del selector.
  if (!perfilActivo || perfiles.length === 0) {
    return (
      <button
        type="button"
        className="perfil-selector-btn perfil-selector-alta"
        onClick={() => navigate('/agregar-perfil')}
        title="Todavía no elegiste tu perfil"
      >
        <span className="perfil-icono"><Icon name="user" /></span>
        <span className="perfil-nombre">Elegir mi perfil</span>
      </button>
    );
  }

  const handleCambioPerfil = (perfil) => {
    cambiarPerfil(perfil.id_perfil);
    setShowDropdown(false);
    
    // Redirigir al dashboard del nuevo perfil
    const nuevaRuta = obtenerDashboardUrl(perfil);
    navigate(nuevaRuta);
  };

  const handleAgregarPerfil = () => {
    setShowDropdown(false);
    navigate('/agregar-perfil');
  };

  const getIconoPerfil = (nombrePerfil) => {
    const iconos = {
      'mayorista': 'mayorista',
      'minorista': 'minorista',
      'comprador': 'comprador',
      'transportista': 'transportista'
    };
    return iconos[nombrePerfil?.toLowerCase()] || 'user';
  };

  return (
    <div className="perfil-selector">
      <button 
        className="perfil-selector-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="perfil-icono"><Icon name={getIconoPerfil(perfilActivo.perfil)} /></span>
        <span className="perfil-nombre">{perfilActivo.perfil}</span>
        <span className="perfil-arrow">{showDropdown ? '▲' : '▼'}</span>
      </button>

      {showDropdown && (
        <>
          <div 
            className="perfil-dropdown-overlay" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="perfil-dropdown">
            <div className="perfil-dropdown-header">
              Cambiar perfil activo
            </div>

            {perfiles.map((perfil) => (
              <button
                key={perfil.id_perfil}
                className={`perfil-dropdown-item ${
                  perfil.id_perfil === perfilActivo.id_perfil ? 'active' : ''
                }`}
                onClick={() => handleCambioPerfil(perfil)}
              >
                <span className="perfil-item-icono">
                  <Icon name={getIconoPerfil(perfil.perfil)} />
                </span>
                <span className="perfil-item-nombre">{perfil.perfil}</span>
                {perfil.id_perfil === perfilActivo.id_perfil && (
                  <span className="perfil-item-check">✓</span>
                )}
              </button>
            ))}

            <div className="perfil-dropdown-divider" />

            <button
              className="perfil-dropdown-item agregar"
              onClick={handleAgregarPerfil}
            >
              <span className="perfil-item-icono"><Icon name="add" /></span>
              <span className="perfil-item-nombre">Agregar otro perfil</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilSelector;
