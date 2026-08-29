import { buscarCultivo } from '../../datos/cultivos';

interface DetalleCultivoProps {
  cultivoId: string;
}

export default function DetalleCultivo({ cultivoId }: DetalleCultivoProps) {
  const cultivo = buscarCultivo(cultivoId);

  if (!cultivo) return null;

  const sol = {
    full: 'Full sun (6h+)',
    partial: 'Partial sun (4-5h)',
    shade: 'Shade (<4h)',
  }[cultivo.sunNeed];

  return (
    <section className="detalle-cultivo tarjeta" aria-label={`Details for ${cultivo.name}`}>
      <h2>
        {cultivo.emoji} {cultivo.name}
      </h2>
      <ul className="lista-datos">
        <li>
          <strong>Sun:</strong> {sol}
        </li>
        <li>
          <strong>Spacing:</strong> {cultivo.spacingCm} cm
        </li>
        <li>
          <strong>Water:</strong> {cultivo.waterNeeds}
        </li>
        <li>
          <strong>Time to harvest:</strong> ~{cultivo.daysToMaturity} days
        </li>
        <li>
          <strong>Seasons:</strong> {cultivo.seasons.join(', ')}
        </li>
        <li>
          <strong>Good companions:</strong>{' '}
          {cultivo.companions.length > 0
            ? cultivo.companions.map((id) => buscarCultivo(id)?.name ?? id).join(', ')
            : 'None listed'}
        </li>
        <li>
          <strong>Avoid:</strong>{' '}
          {cultivo.antagonists.length > 0
            ? cultivo.antagonists.map((id) => buscarCultivo(id)?.name ?? id).join(', ')
            : 'None listed'}
        </li>
      </ul>
    </section>
  );
}
