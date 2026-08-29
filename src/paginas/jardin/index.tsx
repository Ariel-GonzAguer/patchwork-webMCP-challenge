import { useState } from 'react';
import { useJardinStore } from '../../store/jardin';
import { CULTIVOS } from '../../datos/cultivos';
import { MotorReglas } from '../../clases/MotorReglas';
import { ANCHO_GRID, ALTO_GRID, NUMERO_CAMAS } from '../../tipos/jardin';
import Marco from '../../componentes/marco';
import DetalleCultivo from '../../componentes/detalle-cultivo';
import RegistroActividad from '../../componentes/registro-actividad';
import './jardin.css';

const motor = new MotorReglas();
function Jardin() {
  const beds = useJardinStore((estado) => estado.beds);
  const sunHours = useJardinStore((estado) => estado.sunHours);
  const gardenName = useJardinStore((estado) => estado.gardenName);
  const setSunHours = useJardinStore((estado) => estado.setSunHours);
  const setGardenName = useJardinStore((estado) => estado.setGardenName);
  const colocar = useJardinStore((estado) => estado.colocar);
  const retirar = useJardinStore((estado) => estado.retirar);
  const [cropSeleccionado, setCropSeleccionado] = useState<string>('tomato');
  const [mensaje, setMensaje] = useState<string | null>(null);

  function manejarClicCelda(cama: number, x: number, y: number) {
    const yaOcupada = beds[cama]?.some((c) => c.x === x && c.y === y);

    if (yaOcupada) {
      const existente = beds[cama]?.find((c) => c.x === x && c.y === y);
      if (existente) {
        retirar(cama, x, y, 'human', null, 0, `Removed ${existente.crop_id} from bed ${cama + 1} (${x}, ${y})`);
      }
      return;
    }

    const colocacion = { crop_id: cropSeleccionado, x, y };
    const warnings = motor.validarColocacion(
      beds[cama] ?? [],
      colocacion,
      sunHours,
      ANCHO_GRID,
      ALTO_GRID,
    );

    colocar(
      cama,
      colocacion,
      'human',
      null,
      warnings.length,
      `Placed ${cropSeleccionado} in bed ${cama + 1} (${x}, ${y})`,
    );

    if (warnings.length > 0) {
      setMensaje(warnings.map((w) => w.message).join(' '));
    } else {
      setMensaje(null);
    }
  }

  return (
    <Marco>
      <h1>Garden</h1>
      <div className="jardin-layout">
        <div className="jardin-principal">
          <div className="config-jardin tarjeta">
            <label htmlFor="nombre-huerto">Garden name:</label>
            <input
              id="nombre-huerto"
              type="text"
              value={gardenName}
              onChange={(evento) => setGardenName(evento.target.value)}
            />
            <label htmlFor="horas-sol">Sun hours / day:</label>
            <select
              id="horas-sol"
              value={sunHours}
              onChange={(evento) => setSunHours(Number(evento.target.value))}
            >
              {[3, 4, 5, 6, 8, 10].map((horas) => (
                <option key={horas} value={horas}>
                  {horas}h
                </option>
              ))}
            </select>
          </div>

          <div className="selector-cultivo tarjeta">
            <label htmlFor="cultivo">Plant:</label>
            <select
              id="cultivo"
              value={cropSeleccionado}
              onChange={(evento) => setCropSeleccionado(evento.target.value)}
            >
              {CULTIVOS.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.id}>
                  {cultivo.emoji} {cultivo.name}
                </option>
              ))}
            </select>
            <span className="pista-selector">Click a cell to plant, click again to remove</span>
          </div>

          {mensaje && <div className="aviso" role="alert">{mensaje}</div>}

          <div className="camas">
            {Array.from({ length: NUMERO_CAMAS }, (_, cama) => (
              <section key={cama} className="cama tarjeta" aria-label={`Bed ${cama + 1}`}>
                <h2 className="titulo-cama">Bed {cama + 1}</h2>
                <div className="grid" role="grid" aria-label={`Bed ${cama + 1} grid`}>
                  {Array.from({ length: ALTO_GRID }, (_, y) => (
                    <div key={y} className="fila-grid" role="row">
                      {Array.from({ length: ANCHO_GRID }, (_, x) => {
                        const ocupante = beds[cama]?.find((c) => c.x === x && c.y === y);
                        const cultivo = ocupante ? CULTIVOS.find((c) => c.id === ocupante.crop_id) : undefined;
                        return (
                          <button
                            key={x}
                            type="button"
                            role="gridcell"
                            className={ocupante ? 'celda ocupada' : 'celda vacia'}
                            onClick={() => manejarClicCelda(cama, x, y)}
                            aria-label={
                              ocupante
                                ? `${cultivo?.name ?? ocupante.crop_id} at column ${x + 1}, row ${y + 1}. Click to remove.`
                                : `Empty cell at column ${x + 1}, row ${y + 1}. Click to plant ${cropSeleccionado}.`
                            }
                            title={ocupante ? `Remove ${cultivo?.name ?? ocupante.crop_id}` : `Plant ${cropSeleccionado}`}
                          >
                            {cultivo ? cultivo.emoji : ''}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <DetalleCultivo cultivoId={cropSeleccionado} />
        </div>

        <RegistroActividad />
      </div>
    </Marco>
  );
}

export default Jardin;
