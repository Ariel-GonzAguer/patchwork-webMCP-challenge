import { useJardinStore } from '../../store/jardin';
import { buscarCultivo } from '../../datos/cultivos';
import type { TipoTarea } from '../../tipos/dominio';
import Marco from '../../componentes/marco';
import './calendario.css';

const ICONOS_TAREA: Record<TipoTarea, string> = {
  water: '💧',
  fertilize: '🧪',
  harvest: '🧺',
  prune: '✂️',
  observe: '🔍',
};

const ETIQUETAS_TAREA: Record<TipoTarea, string> = {
  water: 'Water',
  fertilize: 'Fertilize',
  harvest: 'Harvest',
  prune: 'Prune',
  observe: 'Observe',
};

function Calendario() {
  const tasks = useJardinStore((estado) => estado.tasks);
  const completarTarea = useJardinStore((estado) => estado.completarTarea);
  const gardenName = useJardinStore((estado) => estado.gardenName);

  const ordenadas = [...tasks].sort(
    (a, b) => a.dueDay - b.dueDay || Number(a.done) - Number(b.done),
  );
  const pendientes = ordenadas.filter((t) => !t.done).length;

  return (
    <Marco>
      <h1>Calendar</h1>
      <p className="subtitulo-calendario">
        {gardenName} — {pendientes} task{pendientes === 1 ? '' : 's'} pending
      </p>

      {ordenadas.length === 0 ? (
        <p className="log-vacio">
          No tasks yet. Plant something in the Garden and care tasks will appear
          here.
        </p>
      ) : (
        <ul className="lista-tareas" aria-label="Garden tasks">
          {ordenadas.map((tarea) => {
            const cultivo = tarea.cropId
              ? buscarCultivo(tarea.cropId)
              : undefined;
            return (
              <li
                key={tarea.id}
                className={`tarea ${tarea.done ? 'hecha' : ''}`}
              >
                <label className="etiqueta-tarea">
                  <input
                    type="checkbox"
                    checked={tarea.done}
                    onChange={() => completarTarea(tarea.id)}
                    aria-label={`Mark ${ETIQUETAS_TAREA[tarea.type]} ${cultivo?.name ?? ''} as ${tarea.done ? 'pending' : 'done'}`}
                  />
                  <span className="icono-tarea">
                    {ICONOS_TAREA[tarea.type]}
                  </span>
                  <span className="texto-tarea">
                    <strong>{ETIQUETAS_TAREA[tarea.type]}</strong>
                    {cultivo ? ` ${cultivo.emoji} ${cultivo.name}` : ''}
                    {tarea.note ? ` — ${tarea.note}` : ''}
                  </span>
                  <span className="dia-tarea">Day {tarea.dueDay}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </Marco>
  );
}

export default Calendario;
