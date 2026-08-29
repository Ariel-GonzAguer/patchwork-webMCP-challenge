import type { ReactNode } from 'react';
import Encabezado from '../encabezado';

interface MarcoProps {
  children: ReactNode;
}

export default function Marco({ children }: MarcoProps) {
  return (
    <div className="marco">
      <Encabezado />
      <main className="contenido">{children}</main>
    </div>
  );
}
