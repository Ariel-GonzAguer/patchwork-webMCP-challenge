import { useState } from 'react';
import { MotorReglas } from '../../clases/MotorReglas';
import { CULTIVOS } from '../../datos/cultivos';
import { SINTOMAS } from '../../tipos/dominio';
import type { ResultadoDiagnostico, TipoSintoma } from '../../tipos/dominio';
import Marco from '../../componentes/marco';
import './diagnostico.css';

const motor = new MotorReglas();

const ETIQUETAS_SINTOMAS: Record<TipoSintoma, string> = {
  yellowing: 'Yellowing leaves',
  brown_spots: 'Brown spots',
  black_spots: 'Black spots',
  wilting: 'Wilting',
  holes: 'Holes in leaves',
  chewed: 'Chewed edges',
  white_powder: 'White powder',
  sticky: 'Sticky residue',
  curling: 'Curled leaves',
  stunted: 'Stunted growth',
  rot: 'Rot',
  mottled: 'Mottled color',
};

const COLOR_SEVERIDAD: Record<ResultadoDiagnostico['severity'], string> = {
  low: 'severidad-baja',
  medium: 'severidad-media',
  high: 'severidad-alta',
};

function Diagnostico() {
  const [cultivoSeleccionado, setCultivoSeleccionado] =
    useState<string>('tomato');
  const [sintomasActivos, setSintomasActivos] = useState<Set<TipoSintoma>>(
    new Set(),
  );

  function alternarSintoma(sintoma: TipoSintoma) {
    setSintomasActivos((previos) => {
      const nuevos = new Set(previos);
      if (nuevos.has(sintoma)) {
        nuevos.delete(sintoma);
      } else {
        nuevos.add(sintoma);
      }
      return nuevos;
    });
  }

  const resultados = motor.diagnosticar(cultivoSeleccionado, [
    ...sintomasActivos,
  ]);

  return (
    <Marco>
      <h1>Diagnose</h1>
      <p className="intro-diagnostico">
        Select the affected crop and the symptoms you see. The rules engine
        matches them against a knowledge base of common problems and suggests
        care actions.
      </p>

      <div className="diagnostico-layout">
        <div>
          <div className="tarjeta panel-controles">
            <label htmlFor="cultivo-diagnostico" className="etiqueta-control">
              Affected crop
            </label>
            <select
              id="cultivo-diagnostico"
              value={cultivoSeleccionado}
              onChange={(evento) => setCultivoSeleccionado(evento.target.value)}
            >
              {CULTIVOS.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.id}>
                  {cultivo.emoji} {cultivo.name}
                </option>
              ))}
            </select>

            <fieldset className="grupo-sintomas">
              <legend>Symptoms</legend>
              <div className="chips-sintomas">
                {SINTOMAS.map((sintoma) => {
                  const activo = sintomasActivos.has(sintoma);
                  return (
                    <button
                      key={sintoma}
                      type="button"
                      className={activo ? 'chip activo' : 'chip'}
                      aria-pressed={activo}
                      onClick={() => alternarSintoma(sintoma)}
                    >
                      {ETIQUETAS_SINTOMAS[sintoma]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <section
            className="resultados"
            aria-label="Diagnosis results"
            aria-live="polite"
          >
            {sintomasActivos.size === 0 ? (
              <p className="sin-resultados">
                Select at least one symptom to get a diagnosis.
              </p>
            ) : resultados.length === 0 ? (
              <p className="sin-resultados">
                No matches for those symptoms. Try adding more, or check the
                Learn page for what the agent can do.
              </p>
            ) : (
              <ul className="lista-diagnosticos">
                {resultados.map((resultado) => (
                  <li key={resultado.issueId} className="diagnostico tarjeta">
                    <div className="cabecera-diagnostico">
                      <h2>{resultado.name}</h2>
                      <span
                        className={`severidad ${COLOR_SEVERIDAD[resultado.severity]}`}
                      >
                        {resultado.severity} severity
                      </span>
                      <span className="confianza">
                        {Math.round(resultado.confidence * 100)}% match
                      </span>
                    </div>
                    <p className="sintomas-coincidentes">
                      <strong>Matched:</strong>{' '}
                      {resultado.matchedSymptoms
                        .map((sintoma) =>
                          ETIQUETAS_SINTOMAS[sintoma].toLowerCase(),
                        )
                        .join(', ')}
                    </p>
                    <ul className="lista-acciones">
                      {resultado.actions.map((accion) => (
                        <li key={accion}>{accion}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside
          className="tarjeta sugerencia-agente"
          aria-label="Ask your agent"
        >
          <h2>Ask your agent</h2>
          <p>
            Open PatchWork in ChatGPT and let the agent diagnose for you. Try
            prompts like:
          </p>
          <ul>
            <li>
              “My tomato leaves are turning yellow with brown spots. Diagnose
              it.”
            </li>
            <li>“Check the garden state and tell me what needs watering.”</li>
            <li>“Plan a fall garden with 4 hours of sun.”</li>
          </ul>
          <p className="nota-agente">
            The agent uses the same rules engine you see here, via the{' '}
            <code>diagnose_issue</code> tool.
          </p>
        </aside>
      </div>
    </Marco>
  );
}

export default Diagnostico;
