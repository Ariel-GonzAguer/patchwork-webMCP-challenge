/* eslint-disable @typescript-eslint/require-await --
   La API de WebMCP exige que los handlers `execute` sean `async` aunque el
   motor de reglas sea síncrono. El contrato externo (browser/agent) asume
   `Promise<unknown>` como tipo de retorno. */

import { useJardinStore } from '../store/jardin';
import { CULTIVOS, buscarCultivo } from '../datos/cultivos';
import { MotorReglas } from '../clases/MotorReglas';
import { SINTOMAS, TIPOS_TAREA, ESTACIONES } from '../tipos/dominio';
import type {
  Colocacion,
  Estacion,
  TipoSintoma,
  TipoTarea,
} from '../tipos/dominio';
import { ANCHO_GRID, ALTO_GRID, NUMERO_CAMAS } from '../tipos/jardin';

const motor = new MotorReglas();

export function webmcpDisponible(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof document.modelContext?.registerTool === 'function'
  );
}

function cultivoACatalogo(cultivoId: string) {
  const cultivo = buscarCultivo(cultivoId);
  if (!cultivo) return null;
  return {
    id: cultivo.id,
    name: cultivo.name,
    emoji: cultivo.emoji,
    sunNeed: cultivo.sunNeed,
    spacingCm: cultivo.spacingCm,
    seasons: cultivo.seasons,
    companions: cultivo.companions.map((id) => {
      const vecino = buscarCultivo(id);
      return vecino ? { id: vecino.id, name: vecino.name } : { id };
    }),
    antagonists: cultivo.antagonists.map((id) => {
      const vecino = buscarCultivo(id);
      return vecino ? { id: vecino.id, name: vecino.name } : { id };
    }),
    daysToMaturity: cultivo.daysToMaturity,
    waterNeeds: cultivo.waterNeeds,
  };
}

function esEntero(valor: unknown, min: number, max: number): valor is number {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= min &&
    valor <= max
  );
}

/**
 * Registra los tools WebMCP de PatchWork en `document.modelContext`.
 * Es seguro llamarla en navegadores sin WebMCP (no hace nada).
 */
export async function registrarToolsWebmcp(): Promise<void> {
  if (!webmcpDisponible()) return;

  const modelContext = document.modelContext;
  if (!modelContext) return;

  const registro = useJardinStore.getState;

  await modelContext.registerTool({
    name: 'list_crops',
    title: 'List crops',
    description:
      'Search the crop catalog by keyword, sun hours, season or maximum spacing. Use this to discover which crops fit the garden conditions before designing a bed.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Partial name match, e.g. "tom". Optional.',
        },
        sun_hours: {
          type: 'number',
          description: 'Hours of direct sun per day the garden receives.',
        },
        season: {
          type: 'string',
          enum: [...ESTACIONES],
          description: 'Only return crops that grow in this season.',
        },
        min_space_cm: {
          type: 'number',
          description:
            'Only return crops whose spacing fits within this many cm.',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const query = typeof input.query === 'string' ? input.query : undefined;
      const sun_hours =
        typeof input.sun_hours === 'number' ? input.sun_hours : undefined;
      const season = ESTACIONES.includes(input.season as Estacion)
        ? (input.season as Estacion)
        : undefined;
      const min_space_cm =
        typeof input.min_space_cm === 'number' ? input.min_space_cm : undefined;

      const criterios: Parameters<typeof motor.filtrarCultivos>[0] = {};
      if (query !== undefined) criterios.query = query;
      if (sun_hours !== undefined) criterios.sun_hours = sun_hours;
      if (season !== undefined) criterios.season = season;
      if (min_space_cm !== undefined) criterios.min_space_cm = min_space_cm;

      const resultados = motor
        .filtrarCultivos(criterios)
        .map((cultivo) => cultivoACatalogo(cultivo.id))
        .filter(
          (cultivo): cultivo is NonNullable<typeof cultivo> => cultivo !== null,
        );

      return {
        count: resultados.length,
        crops: resultados,
      };
    },
  });

  await modelContext.registerTool({
    name: 'get_garden_state',
    title: 'Get garden state',
    description:
      'Read the current state of the shared garden: beds with planted crops, sun hours, and pending care tasks. Use this before planning changes so you work with real, current data.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const estado = registro();

      return {
        gardenName: estado.gardenName,
        sunHours: estado.sunHours,
        bedCount: estado.beds.length,
        grid: { width: ANCHO_GRID, height: ALTO_GRID },
        beds: estado.beds.map((cama, indice) => ({
          bed: indice + 1,
          placements: cama.map((colocacion) => {
            const cultivo = buscarCultivo(colocacion.crop_id);
            return {
              crop_id: colocacion.crop_id,
              crop_name: cultivo?.name ?? 'Unknown',
              emoji: cultivo?.emoji ?? '',
              x: colocacion.x,
              y: colocacion.y,
            };
          }),
        })),
        pendingTasks: estado.tasks
          .filter((tarea) => !tarea.done)
          .map((tarea) => ({
            id: tarea.id,
            type: tarea.type,
            crop_id: tarea.cropId,
            note: tarea.note,
            dueDay: tarea.dueDay,
          })),
      };
    },
  });

  await modelContext.registerTool({
    name: 'design_bed',
    title: 'Design bed',
    description:
      'Add or remove crops on a garden bed cell by cell. Placements are validated against grid bounds, sun needs, spacing and companion rules; warnings are returned so you can adjust and retry. The shared canvas updates live for the human.',
    inputSchema: {
      type: 'object',
      properties: {
        bed: {
          type: 'number',
          description: 'Bed index: 1 or 2.',
        },
        mode: {
          type: 'string',
          enum: ['add', 'remove'],
          description: 'add places new crops; remove clears the cells.',
        },
        placements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              crop_id: {
                type: 'string',
                description: 'Crop id from list_crops.',
              },
              x: { type: 'number', description: 'Column, 0-3.' },
              y: { type: 'number', description: 'Row, 0-5.' },
            },
          },
          description: 'Cells to change. Max 24 placements per call.',
        },
      },
    },
    execute: async (input) => {
      const estado = registro();

      const bedIndex = typeof input.bed === 'number' ? input.bed : NaN;
      if (
        !Number.isInteger(bedIndex) ||
        bedIndex < 1 ||
        bedIndex > estado.beds.length
      ) {
        return {
          error: `bed must be an integer between 1 and ${estado.beds.length}.`,
        };
      }

      const mode = input.mode === 'remove' ? 'remove' : 'add';
      if (
        typeof input.mode !== 'string' ||
        !['add', 'remove'].includes(input.mode)
      ) {
        return { error: 'mode must be "add" or "remove".' };
      }

      const raw = Array.isArray(input.placements) ? input.placements : null;
      if (!raw || raw.length === 0) {
        return { error: 'placements must be a non-empty array.' };
      }
      if (raw.length > 24) {
        return { error: 'placements must contain at most 24 entries.' };
      }

      const validas: Colocacion[] = [];
      const errores: string[] = [];

      for (const entrada of raw) {
        const item = entrada as Record<string, unknown>;
        const crop_id = typeof item.crop_id === 'string' ? item.crop_id : '';
        const x = item.x;
        const y = item.y;

        if (mode === 'remove') {
          if (
            !esEntero(x, 0, ANCHO_GRID - 1) ||
            !esEntero(y, 0, ALTO_GRID - 1)
          ) {
            errores.push(
              `Invalid cell coordinates (${String(x)}, ${String(y)}).`,
            );
            continue;
          }
          validas.push({ crop_id: crop_id || '', x, y });
          continue;
        }

        if (!buscarCultivo(crop_id)) {
          errores.push(`Unknown crop_id "${crop_id}". Use list_crops.`);
          continue;
        }
        if (!esEntero(x, 0, ANCHO_GRID - 1) || !esEntero(y, 0, ALTO_GRID - 1)) {
          errores.push(
            `${crop_id}: coordinates must be integers, x in 0-${ANCHO_GRID - 1}, y in 0-${ALTO_GRID - 1}.`,
          );
          continue;
        }
        validas.push({ crop_id, x, y });
      }

      if (validas.length === 0) {
        return { error: errores.join(' ') };
      }

      const camaActual = estado.beds[bedIndex - 1] ?? [];
      const todasLasAdvertencias: string[] = [];
      const aplicadas: string[] = [];

      for (const colocacion of validas) {
        if (mode === 'remove') {
          const existia = camaActual.some(
            (c) => c.x === colocacion.x && c.y === colocacion.y,
          );
          if (!existia) {
            errores.push(
              `Cell (${colocacion.x}, ${colocacion.y}) is already empty.`,
            );
            continue;
          }
          registro().retirar(
            bedIndex - 1,
            colocacion.x,
            colocacion.y,
            'agent',
            'design_bed',
            0,
            `Removed ${colocacion.crop_id || 'plant'} from bed ${bedIndex} (${colocacion.x}, ${colocacion.y})`,
          );
          aplicadas.push(`removed (${colocacion.x}, ${colocacion.y})`);
          continue;
        }

        const celdaOcupada = camaActual.some(
          (c) => c.x === colocacion.x && c.y === colocacion.y,
        );
        if (celdaOcupada) {
          errores.push(
            `${colocacion.crop_id}: cell (${colocacion.x}, ${colocacion.y}) is already occupied. Remove it first.`,
          );
          continue;
        }

        const warnings = motor.validarColocacion(
          camaActual,
          colocacion,
          estado.sunHours,
          ANCHO_GRID,
          ALTO_GRID,
        );

        if (
          warnings.some((w) => w.type === 'bounds' || w.type === 'unknown_crop')
        ) {
          errores.push(warnings[0]?.message ?? 'Invalid placement.');
          continue;
        }

        registro().colocar(
          bedIndex - 1,
          colocacion,
          'agent',
          'design_bed',
          warnings.length,
          `Placed ${colocacion.crop_id} in bed ${bedIndex} (${colocacion.x}, ${colocacion.y})`,
        );
        aplicadas.push(
          `${colocacion.crop_id} at (${colocacion.x}, ${colocacion.y})`,
        );

        for (const w of warnings) {
          todasLasAdvertencias.push(w.message);
        }
      }

      const estadoFinal = registro();
      const resumen: Record<string, number> = {};
      for (const c of estadoFinal.beds[bedIndex - 1] ?? []) {
        resumen[c.crop_id] = (resumen[c.crop_id] ?? 0) + 1;
      }

      return {
        applied: aplicadas,
        warnings: todasLasAdvertencias,
        errors: errores,
        bedState: resumen,
      };
    },
  });

  await modelContext.registerTool({
    name: 'suggest_plan',
    title: 'Suggest planting plan',
    description:
      'Suggest a seasonal planting plan for the garden: crops that fit the chosen season and sun exposure, ordered by how well they fit, with reasons. The human can then apply suggestions with design_bed.',
    inputSchema: {
      type: 'object',
      properties: {
        season: {
          type: 'string',
          enum: [...ESTACIONES],
          description: 'Target season.',
        },
        sun_hours: {
          type: 'number',
          description:
            'Hours of sun per day (e.g. 8 for full sun, 4 for partial, 3 for shade).',
        },
        bed_count: {
          type: 'number',
          description: 'How many beds to fill. Each bed holds 24 cells.',
        },
        preferences: {
          type: 'array',
          items: { type: 'string' },
          description: 'Crop ids or names the human would like, if any.',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const season = ESTACIONES.includes(input.season as Estacion)
        ? (input.season as Estacion)
        : motor.estacionActual();
      const sun_hours =
        typeof input.sun_hours === 'number'
          ? input.sun_hours
          : registro().sunHours;
      const bed_count =
        typeof input.bed_count === 'number' && input.bed_count >= 1
          ? Math.min(Math.floor(input.bed_count), 4)
          : 2;

      const preferencias = Array.isArray(input.preferences)
        ? input.preferences.filter((p): p is string => typeof p === 'string')
        : undefined;

      const opciones: Parameters<typeof motor.sugerirPlan>[0] = {
        season,
        sunHours: sun_hours,
        bedCount: bed_count,
      };
      if (preferencias !== undefined) opciones.preferences = preferencias;

      const plan = motor.sugerirPlan(opciones);

      return {
        season,
        sunHours: sun_hours,
        plan: plan.map((sugerencia) => {
          const cultivo = buscarCultivo(sugerencia.cropId);
          return {
            crop_id: sugerencia.cropId,
            name: sugerencia.name,
            emoji: sugerencia.emoji,
            spacing_cm: cultivo?.spacingCm ?? null,
            rationale: sugerencia.rationale,
          };
        }),
      };
    },
  });

  await modelContext.registerTool({
    name: 'log_task',
    title: 'Log garden task',
    description:
      'Add a care task to the shared calendar, such as watering, fertilizing, harvesting, pruning or a note to observe. Tasks appear in the Calendar view where the human can check them off.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [...TIPOS_TAREA],
          description: 'Kind of task.',
        },
        crop_id: {
          type: 'string',
          description: 'Crop id this task applies to, if any.',
        },
        note: {
          type: 'string',
          description:
            'Short human-readable note, e.g. "Water deeply, soil is dry".',
        },
        due_day: {
          type: 'number',
          description:
            'Garden day when this is due (0 = today). Defaults to 0.',
        },
      },
    },
    execute: async (input) => {
      const type = input.type;
      if (
        typeof type !== 'string' ||
        !TIPOS_TAREA.includes(type as TipoTarea)
      ) {
        return {
          error: `type must be one of: ${TIPOS_TAREA.join(', ')}.`,
        };
      }

      const crop_id =
        typeof input.crop_id === 'string' && buscarCultivo(input.crop_id)
          ? input.crop_id
          : null;

      if (typeof input.crop_id === 'string' && crop_id === null) {
        return { error: `Unknown crop_id "${input.crop_id}". Use list_crops.` };
      }

      const note =
        typeof input.note === 'string' ? input.note.slice(0, 200) : null;
      const due_day =
        typeof input.due_day === 'number' &&
        Number.isInteger(input.due_day) &&
        input.due_day >= 0
          ? input.due_day
          : 0;

      registro().registrarTarea(
        { type: type as TipoTarea, cropId: crop_id, note, dueDay: due_day },
        'agent',
        'log_task',
      );

      const pendientes = registro().tasks.filter((tarea) => !tarea.done).length;

      return {
        logged: { type, crop_id, note, due_day },
        pendingTaskCount: pendientes,
      };
    },
  });

  await modelContext.registerTool({
    name: 'diagnose_issue',
    title: 'Diagnose plant issue',
    description:
      'Suggest likely plant problems from observed symptoms and an optional affected crop. Returns up to 3 candidates with a confidence score and concrete care actions. This is a knowledge-base lookup, not a medical guarantee.',
    inputSchema: {
      type: 'object',
      properties: {
        crop_id: {
          type: 'string',
          description: 'Affected crop id, if known.',
        },
        symptoms: {
          type: 'array',
          items: {
            type: 'string',
            enum: [...SINTOMAS],
          },
          description: 'Observed symptoms, e.g. ["yellowing", "brown_spots"].',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const crop_id =
        typeof input.crop_id === 'string' && buscarCultivo(input.crop_id)
          ? input.crop_id
          : null;

      const sintomasBrutos = Array.isArray(input.symptoms)
        ? input.symptoms
        : [];
      const sintomas: TipoSintoma[] = sintomasBrutos.filter(
        (sintoma): sintoma is TipoSintoma =>
          typeof sintoma === 'string' &&
          SINTOMAS.includes(sintoma as TipoSintoma),
      );

      if (sintomas.length === 0) {
        return {
          error: `symptoms must include at least one of: ${SINTOMAS.join(', ')}.`,
        };
      }

      const resultados = motor.diagnosticar(crop_id, sintomas);

      return {
        crop_id,
        symptoms: sintomas,
        candidates: resultados.map((r) => ({
          issue_id: r.issueId,
          name: r.name,
          severity: r.severity,
          confidence: Math.round(r.confidence * 100) / 100,
          matched_symptoms: r.matchedSymptoms,
          actions: r.actions,
        })),
      };
    },
  });

  const estado = registro();
  estado.registrarLog({
    actor: 'agent',
    tool: null,
    message: `WebMCP tools registered (${NUMERO_CAMAS} beds, ${CULTIVOS.length} crops).`,
    warningCount: 0,
  });
}
