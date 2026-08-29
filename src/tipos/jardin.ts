import type { Colocacion, TipoTarea } from './dominio';

export const ANCHO_GRID = 4;
export const ALTO_GRID = 6;
export const NUMERO_CAMAS = 2;

export interface TareaJardin {
  id: string;
  type: TipoTarea;
  cropId: string | null;
  note: string | null;
  /** Día relativo al "día 0" del huerto en el que la tarea vence. */
  dueDay: number;
  done: boolean;
}

export interface EntradaLog {
  id: string;
  /** 'agent' | 'human' — quién provocó el cambio. */
  actor: 'agent' | 'human';
  tool: string | null;
  message: string;
  timestamp: number;
  warningCount: number;
}

export interface EstadoJardin {
  gardenName: string;
  sunHours: number;
  /** Día 0 del huerto (epoch ms). */
  startDate: number;
  /** Colocaciones por cama (índice del array = número de cama). */
  beds: Colocacion[][];
  tasks: TareaJardin[];
  log: EntradaLog[];
}

export interface AccionesJardin {
  setGardenName: (nombre: string) => void;
  setSunHours: (horas: number) => void;
  colocar: (
    cama: number,
    colocacion: Colocacion,
    actor: 'agent' | 'human',
    tool: string | null,
    warnings: number,
    resumen: string,
  ) => void;
  retirar: (
    cama: number,
    x: number,
    y: number,
    actor: 'agent' | 'human',
    tool: string | null,
    warnings: number,
    resumen: string,
  ) => void;
  completarTarea: (id: string) => void;
  registrarTarea: (
    tarea: Omit<TareaJardin, 'id' | 'done'>,
    actor: 'agent' | 'human',
    tool: string | null,
  ) => void;
  registrarLog: (entrada: Omit<EntradaLog, 'id' | 'timestamp'>) => void;
  reiniciarJardin: () => void;
}
