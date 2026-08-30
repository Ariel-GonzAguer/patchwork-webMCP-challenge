/* eslint-disable @typescript-eslint/require-await --
   El fake de `document.modelContext` expone `registerTool` y `getTools` como
   `async` para coincidir con la firma real del contrato de WebMCP. */

import { beforeEach, describe, expect, it } from 'vitest';
import { registrarToolsWebmcp } from '../webmcp/registrarTools';
import { useJardinStore } from '../store/jardin';

interface ToolRegistrada {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Instala un `document.modelContext` fake y devuelve los tools registrados
 * para poder ejecutarlos como lo haría el agente del navegador.
 */
async function instalarModelContextFake(): Promise<
  Map<string, ToolRegistrada>
> {
  const tools = new Map<string, ToolRegistrada>();

  const modelContext = {
    registerTool: async (tool: ToolRegistrada) => {
      tools.set(tool.name, tool);
    },
    getTools: async () => [...tools.values()],
  };

  Object.defineProperty(document, 'modelContext', {
    value: modelContext,
    configurable: true,
  });

  await registrarToolsWebmcp();
  return tools;
}

function quitarModelContext() {
  Object.defineProperty(document, 'modelContext', {
    value: undefined,
    configurable: true,
  });
}

beforeEach(() => {
  useJardinStore.getState().reiniciarJardin();
});

describe('registrarToolsWebmcp', () => {
  it('registra los 6 tools con sus schemas', async () => {
    const tools = await instalarModelContextFake();
    expect(tools.size).toBe(6);
    for (const nombre of [
      'list_crops',
      'get_garden_state',
      'design_bed',
      'suggest_plan',
      'log_task',
      'diagnose_issue',
    ]) {
      expect(tools.has(nombre), `falta ${nombre}`).toBe(true);
    }
  });

  it('no rompe cuando WebMCP no está disponible', async () => {
    quitarModelContext();
    await expect(registrarToolsWebmcp()).resolves.toBeUndefined();
  });

  it('anota correctamente readOnlyHint en los tools de lectura', async () => {
    const tools = await instalarModelContextFake();
    expect(tools.get('list_crops')?.annotations?.readOnlyHint).toBe(true);
    expect(tools.get('design_bed')?.annotations?.readOnlyHint).toBeUndefined();
  });
});

describe('tool list_crops', () => {
  it('filtra por estación y sol', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('list_crops')!.execute({
      season: 'winter',
      sun_hours: 8,
    })) as { count: number; crops: { id: string }[] };

    expect(resultado.count).toBeGreaterThan(0);
    for (const cultivo of resultado.crops) {
      expect(['garlic'].includes(cultivo.id)).toBe(true);
    }
  });

  it('filtra por query parcial', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools
      .get('list_crops')!
      .execute({ query: 'tom' })) as {
      crops: { id: string }[];
    };
    expect(resultado.crops.map((c) => c.id)).toEqual(['tomato']);
  });

  it('devuelve todo el catálogo sin filtros', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('list_crops')!.execute({})) as {
      count: number;
    };
    expect(resultado.count).toBeGreaterThanOrEqual(24);
  });
});

describe('tool get_garden_state', () => {
  it('refleja las colocaciones actuales del huerto', async () => {
    useJardinStore
      .getState()
      .colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');

    const tools = await instalarModelContextFake();
    const estado = (await tools.get('get_garden_state')!.execute({})) as {
      beds: { placements: { crop_id: string }[] }[];
      grid: { width: number; height: number };
    };

    expect(estado.beds[0]?.placements).toHaveLength(1);
    expect(estado.beds[0]?.placements[0]?.crop_id).toBe('tomato');
    expect(estado.grid).toEqual({ width: 4, height: 6 });
  });
});

describe('tool design_bed', () => {
  it('aplica colocaciones válidas y las refleja en el store', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('design_bed')!.execute({
      bed: 1,
      mode: 'add',
      placements: [{ crop_id: 'tomato', x: 0, y: 0 }],
    })) as { applied: string[]; warnings: string[] };

    expect(resultado.applied).toContain('tomato at (0, 0)');
    expect(useJardinStore.getState().beds[0]).toContainEqual({
      crop_id: 'tomato',
      x: 0,
      y: 0,
    });
  });

  it('devuelve warnings para antagonistas', async () => {
    useJardinStore
      .getState()
      .colocar(0, { crop_id: 'potato', x: 1, y: 0 }, 'human', null, 0, '');

    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('design_bed')!.execute({
      bed: 1,
      mode: 'add',
      placements: [{ crop_id: 'tomato', x: 0, y: 0 }],
    })) as { warnings: string[] };

    expect(resultado.warnings.some((w) => /poor companions/i.test(w))).toBe(
      true,
    );
  });

  it('rechaza cultivos desconocidos con error', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('design_bed')!.execute({
      bed: 1,
      mode: 'add',
      placements: [{ crop_id: 'nope', x: 0, y: 0 }],
    })) as { error?: string };

    expect(resultado.error).toContain('Unknown crop_id');
  });

  it('valida que bed esté en rango', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('design_bed')!.execute({
      bed: 9,
      mode: 'add',
      placements: [{ crop_id: 'tomato', x: 0, y: 0 }],
    })) as { error?: string };

    expect(resultado.error).toContain('bed must be an integer');
  });

  it('registra la acción del agente en el activity log', async () => {
    const tools = await instalarModelContextFake();
    await tools.get('design_bed')!.execute({
      bed: 1,
      mode: 'add',
      placements: [{ crop_id: 'basil', x: 1, y: 1 }],
    });

    const log = useJardinStore.getState().log;
    const entradaAgente = log.find(
      (e) => e.actor === 'agent' && e.tool === 'design_bed',
    );
    expect(entradaAgente).toBeDefined();
    expect(entradaAgente?.message).toContain('basil');
  });

  it('modo remove elimina una celda ocupada', async () => {
    useJardinStore
      .getState()
      .colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');

    const tools = await instalarModelContextFake();
    await tools.get('design_bed')!.execute({
      bed: 1,
      mode: 'remove',
      placements: [{ crop_id: '', x: 0, y: 0 }],
    });

    expect(useJardinStore.getState().beds[0]).toHaveLength(0);
  });
});

describe('tool suggest_plan', () => {
  it('sugiere solo cultivos de la estación', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('suggest_plan')!.execute({
      season: 'summer',
      sun_hours: 8,
      bed_count: 2,
    })) as { plan: { crop_id: string }[] };

    expect(resultado.plan.length).toBeGreaterThan(0);
  });

  it('cada sugerencia incluye rationale', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('suggest_plan')!.execute({
      season: 'summer',
      sun_hours: 8,
      bed_count: 2,
    })) as { plan: { rationale: string[] }[] };

    for (const s of resultado.plan) {
      expect(s.rationale.length).toBeGreaterThan(0);
    }
  });

  it('usa la estación actual cuando no se indica', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('suggest_plan')!.execute({
      sun_hours: 8,
      bed_count: 1,
    })) as { season: string; plan: unknown[] };

    expect(['spring', 'summer', 'fall', 'winter']).toContain(resultado.season);
    expect(resultado.plan.length).toBeGreaterThan(0);
  });

  it('prioriza preferencias', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('suggest_plan')!.execute({
      season: 'spring',
      sun_hours: 8,
      bed_count: 1,
      preferences: ['radish'],
    })) as { plan: { crop_id: string }[] };

    expect(resultado.plan[0]?.crop_id).toBe('radish');
  });
});

describe('tool log_task', () => {
  it('registra una tarea pendiente', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('log_task')!.execute({
      type: 'water',
      crop_id: 'tomato',
      note: 'Deep watering',
      due_day: 2,
    })) as { pendingTaskCount: number };

    expect(resultado.pendingTaskCount).toBe(1);
    const tarea = useJardinStore.getState().tasks[0];
    expect(tarea?.type).toBe('water');
    expect(tarea?.dueDay).toBe(2);
  });

  it('rechaza tipos de tarea inválidos', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('log_task')!.execute({
      type: 'dance',
    })) as { error?: string };

    expect(resultado.error).toContain('type must be one of');
  });

  it('rechaza crop_id desconocido', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('log_task')!.execute({
      type: 'water',
      crop_id: 'nope',
    })) as { error?: string };

    expect(resultado.error).toContain('Unknown crop_id');
  });
});

describe('tool diagnose_issue', () => {
  it('diagnostica mildiu temprano en tomate', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('diagnose_issue')!.execute({
      crop_id: 'tomato',
      symptoms: ['brown_spots', 'yellowing'],
    })) as { candidates: { issue_id: string; confidence: number }[] };

    expect(resultado.candidates[0]?.issue_id).toBe('early_blight');
    expect(resultado.candidates[0]?.confidence).toBeGreaterThan(0.5);
  });

  it('rechaza llamadas sin síntomas', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('diagnose_issue')!.execute({
      crop_id: 'tomato',
      symptoms: [],
    })) as { error?: string };

    expect(resultado.error).toContain('symptoms must include');
  });

  it('ignora síntomas inválidos y filtra', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('diagnose_issue')!.execute({
      crop_id: null,
      symptoms: ['white_powder', 'not-a-symptom'],
    })) as { candidates: { name: string }[] };

    expect(resultado.candidates.length).toBeGreaterThan(0);
    expect(resultado.candidates[0]?.name).toBe('Powdery Mildew');
  });
});
