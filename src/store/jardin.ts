import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccionesJardin, EstadoJardin } from '../tipos/jardin';
import { NUMERO_CAMAS } from '../tipos/jardin';

const CLAVE_ALMACEN = 'patchwork-jardin-v1';

const VERSION_ACTUAL = 1;

export function migrarEstado(estadoPersistido: unknown, version: number): EstadoJardin {
  let estado = estadoPersistido as Partial<EstadoJardin>;

  if (version < 1) {
    estado = {
      ...estadoInicial(),
      ...estado,
      beds: estado.beds ?? estadoInicial().beds,
      tasks: estado.tasks ?? estadoInicial().tasks,
      log: estado.log ?? estadoInicial().log,
    };
  }

  // Agregar futuras migraciones acá:
  // if (version < 2) { ... }
  // o modificar la implementación para capturar cambios de versión mayores en un solo bloque.

  return estado as EstadoJardin;
}

function estadoInicial(): EstadoJardin {
  return {
    gardenName: 'My PatchWork Garden',
    sunHours: 8,
    startDate: Date.now(),
    beds: Array.from({ length: NUMERO_CAMAS }, () => []),
    tasks: [],
    log: [],
  };
}

function generarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useJardinStore = create<EstadoJardin & AccionesJardin>()(
  persist(
    (set) => ({
      ...estadoInicial(),

      setGardenName: (nombre) => set({ gardenName: nombre }),

      setSunHours: (horas) => set({ sunHours: horas }),

      colocar: (cama, colocacion, actor, tool, warnings, resumen) => {
        set((estado) => {
          const beds = estado.beds.map((camaActual, indice) =>
            indice === cama ? [...camaActual, colocacion] : camaActual,
          );
          const entrada = {
            id: generarId(),
            actor,
            tool,
            message: resumen,
            warningCount: warnings,
            timestamp: Date.now(),
          };
          return { beds, log: [...estado.log, entrada] };
        });
      },

      retirar: (cama, x, y, actor, tool, warnings, resumen) => {
        set((estado) => {
          const beds = estado.beds.map((camaActual, indice) =>
            indice === cama
              ? camaActual.filter((c) => !(c.x === x && c.y === y))
              : camaActual,
          );
          const entrada = {
            id: generarId(),
            actor,
            tool,
            message: resumen,
            warningCount: warnings,
            timestamp: Date.now(),
          };
          return { beds, log: [...estado.log, entrada] };
        });
      },

      completarTarea: (id) => {
        set((estado) => ({
          tasks: estado.tasks.map((tarea) =>
            tarea.id === id ? { ...tarea, done: true } : tarea,
          ),
        }));
      },

      registrarTarea: (tarea, actor, tool) => {
        set((estado) => {
          const nuevaTarea = { ...tarea, id: generarId(), done: false };
          const entrada = {
            id: generarId(),
            actor,
            tool,
            message: `Task logged: ${tarea.type}${tarea.cropId ? ` for ${tarea.cropId}` : ''}`,
            warningCount: 0,
            timestamp: Date.now(),
          };
          return {
            tasks: [...estado.tasks, nuevaTarea],
            log: [...estado.log, entrada],
          };
        });
      },

      registrarLog: (entrada) => {
        set((estado) => ({
          log: [
            ...estado.log,
            { ...entrada, id: generarId(), timestamp: Date.now() },
          ],
        }));
      },

      reiniciarJardin: () => {
        set(estadoInicial());
      },
    }),
    {
      name: CLAVE_ALMACEN,
      version: VERSION_ACTUAL,
      migrate: migrarEstado,
    },
  ),
);

export function seleccionarLog(estado: EstadoJardin) {
  return estado.log;
}
