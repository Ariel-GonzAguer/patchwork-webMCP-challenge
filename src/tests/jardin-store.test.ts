import { beforeEach, describe, expect, it } from 'vitest';
import { useJardinStore, migrarEstado } from '../store/jardin';
import type { EstadoJardin } from '../tipos/jardin';

describe('store del jardín', () => {
  beforeEach(() => {
    useJardinStore.getState().reiniciarJardin();
    localStorage.clear();
  });

  describe('migración de estado', () => {
    it('migra estado de versión 0 preservando datos existentes', () => {
      const estadoAntiguo = {
        gardenName: 'Jardín antiguo',
        sunHours: 6,
        startDate: 1000000,
        beds: [[{ crop_id: 'tomato', x: 0, y: 0 }], []],
        tasks: [],
        log: [],
      };

      const migrado = migrarEstado(estadoAntiguo, 0);

      expect(migrado.gardenName).toBe('Jardín antiguo');
      expect(migrado.sunHours).toBe(6);
      expect(migrado.beds[0]).toEqual([{ crop_id: 'tomato', x: 0, y: 0 }]);
      expect(migrado.beds[1]).toEqual([]);
    });

    it('migra estado de versión 0 con campos faltantes usando defaults', () => {
      const estadoIncompleto = {
        gardenName: 'Jardín parcial',
      };

      const migrado = migrarEstado(estadoIncompleto, 0);

      expect(migrado.gardenName).toBe('Jardín parcial');
      expect(migrado.beds).toHaveLength(2);
      expect(migrado.tasks).toEqual([]);
      expect(migrado.log).toEqual([]);
    });

    it('no modifica estado que ya está en versión actual', () => {
      const estadoV1: EstadoJardin = {
        gardenName: 'Jardín v1',
        sunHours: 10,
        startDate: 2000000,
        beds: [[], [{ crop_id: 'basil', x: 1, y: 1 }]],
        tasks: [],
        log: [],
      };

      const migrado = migrarEstado(estadoV1, 1);

      expect(migrado).toEqual(estadoV1);
    });

    it('migra estado sin beds/tasks/log definiéndolos como vacíos', () => {
      const estadoVacio = {};

      const migrado = migrarEstado(estadoVacio, 0);

      expect(migrado.beds).toBeDefined();
      expect(migrado.tasks).toBeDefined();
      expect(migrado.log).toBeDefined();
    });
  });

  it('inicia con dos camas vacías', () => {
    const estado = useJardinStore.getState();
    expect(estado.beds).toHaveLength(2);
    expect(estado.beds[0]).toHaveLength(0);
    expect(estado.log).toHaveLength(0);
  });

  it('colocar agrega una colocación a la cama indicada', () => {
    useJardinStore
      .getState()
      .colocar(
        0,
        { crop_id: 'tomato', x: 0, y: 0 },
        'human',
        null,
        0,
        'Placed tomato',
      );
    const estado = useJardinStore.getState();
    expect(estado.beds[0]).toEqual([{ crop_id: 'tomato', x: 0, y: 0 }]);
    expect(estado.beds[1]).toHaveLength(0);
  });

  it('colocar registra una entrada en el log con actor y warnings', () => {
    useJardinStore
      .getState()
      .colocar(
        0,
        { crop_id: 'basil', x: 1, y: 1 },
        'agent',
        'design_bed',
        2,
        'Placed basil',
      );
    const entrada = useJardinStore.getState().log[0];
    expect(entrada?.actor).toBe('agent');
    expect(entrada?.tool).toBe('design_bed');
    expect(entrada?.warningCount).toBe(2);
  });

  it('retirar elimina solo la celda indicada', () => {
    const { colocar, retirar } = useJardinStore.getState();
    colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');
    colocar(0, { crop_id: 'basil', x: 2, y: 2 }, 'human', null, 0, '');
    retirar(0, 0, 0, 'human', null, 0, 'Removed tomato');

    const estado = useJardinStore.getState();
    expect(estado.beds[0]).toEqual([{ crop_id: 'basil', x: 2, y: 2 }]);
  });

  it('registrarTarea crea una tarea pendiente', () => {
    useJardinStore
      .getState()
      .registrarTarea(
        { type: 'water', cropId: 'tomato', note: null, dueDay: 3 },
        'agent',
        'log_task',
      );
    const tarea = useJardinStore.getState().tasks[0];
    expect(tarea?.done).toBe(false);
    expect(tarea?.dueDay).toBe(3);
  });

  it('completarTarea marca solo la tarea indicada', () => {
    const { registrarTarea, completarTarea } = useJardinStore.getState();
    registrarTarea(
      { type: 'water', cropId: null, note: null, dueDay: 1 },
      'human',
      null,
    );
    registrarTarea(
      { type: 'harvest', cropId: null, note: null, dueDay: 2 },
      'human',
      null,
    );

    const primera = useJardinStore.getState().tasks[0];
    if (!primera) throw new Error('No hay tarea');
    completarTarea(primera.id);

    const estado = useJardinStore.getState();
    expect(estado.tasks.find((t) => t.id === primera.id)?.done).toBe(true);
    expect(estado.tasks.filter((t) => !t.done)).toHaveLength(1);
  });

  it('reiniciarJardin vuelve al estado inicial', () => {
    const { colocar, registrarTarea, reiniciarJardin } =
      useJardinStore.getState();
    colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');
    registrarTarea(
      { type: 'water', cropId: null, note: null, dueDay: 1 },
      'human',
      null,
    );
    reiniciarJardin();

    const estado = useJardinStore.getState();
    expect(estado.beds[0]).toHaveLength(0);
    expect(estado.tasks).toHaveLength(0);
    expect(estado.log).toHaveLength(0);
  });

  it('setSunHours y setGardenName actualizan la configuración', () => {
    useJardinStore.getState().setSunHours(4);
    useJardinStore.getState().setGardenName('Huerto de prueba');
    const estado = useJardinStore.getState();
    expect(estado.sunHours).toBe(4);
    expect(estado.gardenName).toBe('Huerto de prueba');
  });

  it('el log acumula entradas en orden cronológico', () => {
    const { colocar } = useJardinStore.getState();
    colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, 'a');
    colocar(0, { crop_id: 'basil', x: 1, y: 1 }, 'agent', 'design_bed', 0, 'b');
    const log = useJardinStore.getState().log;
    expect(log).toHaveLength(2);
    expect(log[0]?.message).toBe('a');
    expect(log[1]?.message).toBe('b');
  });
});
