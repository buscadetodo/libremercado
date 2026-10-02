import React, { useEffect, useRef } from 'react';

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible (informe QA 30/09: "el modal no se anuncia como
 * diálogo ni mueve el foco").
 *
 * - Se anuncia como role="dialog" + aria-modal, titulado por `titleId`.
 * - Al abrir, mueve el foco al primer control; Tab queda dentro del modal.
 * - Escape o clic en el fondo lo cierran; al cerrar, el foco vuelve a
 *   donde estaba (el botón que lo abrió).
 *
 * Los estilos siguen siendo los de cada pantalla: se pasan las clases del
 * fondo (`overlayClassName`) y de la caja (`className`).
 */
function Modal({ onClose, titleId, overlayClassName, className, children }) {
  const cajaRef = useRef(null);
  // onClose suele ser una arrow nueva en cada render: se guarda en un ref para
  // que el efecto de foco corra solo al montar.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const focoPrevio = document.activeElement;
    const caja = cajaRef.current;
    const enfocables = () => Array.from(caja.querySelectorAll(SELECTOR_FOCO));

    (enfocables()[0] || caja).focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const lista = enfocables();
      if (lista.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    caja.addEventListener('keydown', onKeyDown);
    return () => {
      caja.removeEventListener('keydown', onKeyDown);
      if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
    };
  }, []);

  return (
    <div className={overlayClassName} onClick={() => onCloseRef.current()}>
      <div
        ref={cajaRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
