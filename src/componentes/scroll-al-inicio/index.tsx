import { useEffect } from 'react';
import { useLocation } from '@arielgonzaguer/michi-router';

/** Vuelve al inicio de la página al cambiar de ruta (SPA). */
export default function ScrollAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
