import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterMejorado.css';
import './AuthMejorado.css';

function SeleccionTipoCuenta() {
  const navigate = useNavigate();

  const tiposCuenta = [
    {
      tipo: 'mayorista',
      titulo: 'Soy Mayorista',
      icono: '🏭',
      descripcion: 'Vendo productos al por mayor',
      color: '#667eea',
      requisitos: ['CUIT', 'Razón Social', 'Productos al por mayor'],
      beneficios: ['Llega a más clientes', 'Gestiona tu catálogo', 'Recibe pedidos online']
    },
    {
      tipo: 'minorista',
      titulo: 'Soy Minorista',
      icono: '🏪',
      descripcion: 'Tengo un comercio y compro por mayor',
      color: '#764ba2',
      requisitos: ['CUIT/CUIL', 'Nombre del negocio', 'Dirección'],
      beneficios: ['Encuentra mejores precios', 'Compara proveedores', 'Organiza tus compras']
    },
    {
      tipo: 'comprador',
      titulo: 'Soy Comprador',
      icono: '🛍️',
      descripcion: 'Compro productos para consumo',
      color: '#4facfe',
      requisitos: ['DNI', 'Email', 'Dirección de entrega'],
      beneficios: ['Accede a precios mayoristas', 'Gran variedad de productos', 'Compra online']
    },
    {
      tipo: 'transportista',
      titulo: 'Soy Transportista',
      icono: '🚚',
      descripcion: 'Ofrezco servicios de flete',
      color: '#f093fb',
      requisitos: ['CUIT', 'Datos del vehículo', 'Patente'],
      beneficios: ['Consigue más clientes', 'Gestiona tus viajes', 'Tarifas personalizadas']
    }
  ];

  const handleSeleccion = (tipo) => {
    navigate(`/registro/${tipo}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card seleccion-tipo">
        <div className="seleccion-header">
          <h1>¡Bienvenido a LibreMercado!</h1>
          <p className="subtitle">Elegí el tipo de cuenta que mejor se adapte a vos</p>
        </div>

        <div className="tipos-cuenta-grid-mejorado">
          {tiposCuenta.map((cuenta) => (
            <div
              key={cuenta.tipo}
              className="tipo-cuenta-card-mejorado"
              style={{ '--color': cuenta.color }}
              onClick={() => handleSeleccion(cuenta.tipo)}
            >
              <div className="tipo-card-header">
                <div className="tipo-icono-grande">{cuenta.icono}</div>
                <h3>{cuenta.titulo}</h3>
                <p className="tipo-descripcion">{cuenta.descripcion}</p>
              </div>

              <div className="tipo-card-body">
                <div className="tipo-requisitos">
                  <small>Lo que necesitás:</small>
                  <ul>
                    {cuenta.requisitos.map((req, idx) => (
                      <li key={idx}>✓ {req}</li>
                    ))}
                  </ul>
                </div>

                <div className="tipo-beneficios">
                  <small>Beneficios:</small>
                  <ul>
                    {cuenta.beneficios.map((ben, idx) => (
                      <li key={idx}>• {ben}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button className="btn-seleccionar-mejorado">
                Registrarme →
              </button>
            </div>
          ))}
        </div>

        <div className="login-redirect">
          ¿Ya tenés cuenta? <a href="/login">Iniciá sesión aquí</a>
        </div>
      </div>

      <style jsx>{`
        .seleccion-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .seleccion-header h1 {
          font-size: 32px;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .tipos-cuenta-grid-mejorado {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .tipo-cuenta-card-mejorado {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .tipo-cuenta-card-mejorado::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .tipo-cuenta-card-mejorado:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
          border-color: var(--color);
        }

        .tipo-cuenta-card-mejorado:hover::before {
          transform: scaleX(1);
        }

        .tipo-card-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .tipo-icono-grande {
          font-size: 52px;
          margin-bottom: 12px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .tipo-cuenta-card-mejorado h3 {
          color: #2d3748;
          margin-bottom: 6px;
          font-size: 18px;
        }

        .tipo-descripcion {
          color: #718096;
          font-size: 13px;
          margin-bottom: 0;
        }

        .tipo-card-body {
          flex: 1;
          margin-bottom: 16px;
        }

        .tipo-requisitos,
        .tipo-beneficios {
          margin-bottom: 12px;
        }

        .tipo-requisitos small,
        .tipo-beneficios small {
          color: #a0aec0;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        .tipo-requisitos ul,
        .tipo-beneficios ul {
          list-style: none;
          padding: 0;
          margin: 6px 0 0 0;
        }

        .tipo-requisitos li,
        .tipo-beneficios li {
          color: #4a5568;
          font-size: 12px;
          padding: 3px 0;
          line-height: 1.5;
        }

        .btn-seleccionar-mejorado {
          width: 100%;
          padding: 12px;
          background: var(--color);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-seleccionar-mejorado:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1400px) {
          .tipos-cuenta-grid-mejorado {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .tipos-cuenta-grid-mejorado {
            grid-template-columns: 1fr;
          }

          .seleccion-header h1 {
            font-size: 24px;
          }

          .tipo-icono-grande {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
}

export default SeleccionTipoCuenta;
