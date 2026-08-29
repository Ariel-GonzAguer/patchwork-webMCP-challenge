import { Link } from '@arielgonzaguer/michi-router';
import IndicadorWebmcp from '../indicador-webmcp';

const enlaces = [
  { a: '/', etiqueta: 'Garden' },
  { a: '/calendario', etiqueta: 'Calendar' },
  { a: '/diagnostico', etiqueta: 'Diagnose' },
  { a: '/aprender', etiqueta: 'Learn' },
] as const;

export default function Encabezado() {
  return (
    <header className="encabezado">
      <span className="marca" aria-label="PatchWork home">
        🌱 PatchWork
      </span>
      <nav aria-label="Navegación principal" className="nav-principal">
        {enlaces.map(({ a, etiqueta }) => (
          <Link key={a} to={a}>
            {etiqueta}
          </Link>
        ))}
      </nav>
      <IndicadorWebmcp />
    </header>
  );
}
