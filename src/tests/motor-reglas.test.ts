import { describe, expect, it } from 'vitest';
import { MotorReglas, horasASol } from '../clases/MotorReglas';
import { CULTIVOS, buscarCultivo } from '../datos/cultivos';
import type { TipoSintoma } from '../tipos/dominio';

const motor = new MotorReglas();

describe('horasASol', () => {
  it('mapea 6+ horas a full sun', () => {
    expect(horasASol(6)).toBe('full');
    expect(horasASol(9)).toBe('full');
  });

  it('mapea 4-5 horas a partial sun', () => {
    expect(horasASol(4)).toBe('partial');
    expect(horasASol(5)).toBe('partial');
  });

  it('mapea menos de 4 horas a shade', () => {
    expect(horasASol(3)).toBe('shade');
  });
});

describe('filtrarCultivos', () => {
  it('devuelve todos los cultivos sin criterios', () => {
    expect(motor.filtrarCultivos()).toHaveLength(CULTIVOS.length);
  });

  it('filtra por nombre parcial (case insensitive)', () => {
    const resultados = motor.filtrarCultivos({ query: 'tom' });
    expect(resultados.map((c) => c.id)).toEqual(['tomato']);
  });

  it('filtra por estación', () => {
    const resultados = motor.filtrarCultivos({ season: 'winter' });
    expect(resultados.every((c) => c.seasons.includes('winter'))).toBe(true);
  });

  it('filtra por horas de sol (excluye full-sun en sombra)', () => {
    const resultados = motor.filtrarCultivos({ sun_hours: 3 });
    expect(resultados.every((c) => c.sunNeed === 'shade')).toBe(true);
  });

  it('filtra por espacio máximo', () => {
    const resultados = motor.filtrarCultivos({ min_space_cm: 20 });
    expect(resultados.every((c) => c.spacingCm <= 20)).toBe(true);
  });

  it('combina criterios: primavera + partial sun', () => {
    const resultados = motor.filtrarCultivos({ season: 'spring', sun_hours: 5 });
    expect(resultados.every((c) => c.seasons.includes('spring'))).toBe(true);
    expect(resultados.every((c) => c.sunNeed !== 'full')).toBe(true);
  });
});

describe('validarColocacion', () => {
  const grid = { ancho: 4, alto: 6 };

  it('acepta una colocación válida sin warnings', () => {
    const warnings = motor.validarColocacion([], { crop_id: 'tomato', x: 0, y: 0 }, 8, grid.ancho, grid.alto);
    expect(warnings).toHaveLength(0);
  });

  it('rechaza cultivos desconocidos', () => {
    const warnings = motor.validarColocacion([], { crop_id: 'dragonfruit', x: 0, y: 0 }, 8, grid.ancho, grid.alto);
    expect(warnings[0]?.type).toBe('unknown_crop');
  });

  it('rechaza posiciones fuera del grid', () => {
    const warnings = motor.validarColocacion([], { crop_id: 'tomato', x: 5, y: 0 }, 8, grid.ancho, grid.alto);
    expect(warnings[0]?.type).toBe('bounds');
  });

  it('detecta celda ocupada', () => {
    const warnings = motor.validarColocacion(
      [{ crop_id: 'basil', x: 1, y: 1 }],
      { crop_id: 'tomato', x: 1, y: 1 },
      8,
      grid.ancho,
      grid.alto,
    );
    expect(warnings.some((w) => w.type === 'duplicate')).toBe(true);
  });

  it('advierte cuando el cultivo no recibe suficiente sol', () => {
    const warnings = motor.validarColocacion([], { crop_id: 'tomato', x: 0, y: 0 }, 3, grid.ancho, grid.alto);
    expect(warnings.some((w) => w.type === 'sun')).toBe(true);
  });

  it('advierte sobre espaciado insuficiente entre vecinos', () => {
    // Tomato (60cm) junto a basil (25cm): separación mínima ~1.4 celdas.
    const warnings = motor.validarColocacion(
      [{ crop_id: 'basil', x: 0, y: 0 }],
      { crop_id: 'tomato', x: 1, y: 0 },
      8,
      grid.ancho,
      grid.alto,
    );
    expect(warnings.some((w) => w.type === 'spacing')).toBe(true);
  });

  it('no advierte espaciado cuando hay distancia suficiente', () => {
    const warnings = motor.validarColocacion(
      [{ crop_id: 'basil', x: 0, y: 0 }],
      { crop_id: 'tomato', x: 3, y: 0 },
      8,
      grid.ancho,
      grid.alto,
    );
    expect(warnings.some((w) => w.type === 'spacing')).toBe(false);
  });

  it('advierte sobre cultivos antagonistas', () => {
    // Tomato y potato son malos compañeros.
    const warnings = motor.validarColocacion(
      [{ crop_id: 'potato', x: 0, y: 0 }],
      { crop_id: 'tomato', x: 1, y: 0 },
      8,
      grid.ancho,
      grid.alto,
    );
    expect(warnings.some((w) => w.type === 'antagonist')).toBe(true);
  });

  it('no advierte entre cultivos compañeros', () => {
    // Tomato y basil son buenos compañeros.
    const warnings = motor.validarColocacion(
      [{ crop_id: 'basil', x: 0, y: 0 }],
      { crop_id: 'tomato', x: 1, y: 0 },
      8,
      grid.ancho,
      grid.alto,
    );
    expect(warnings.some((w) => w.type === 'antagonist')).toBe(false);
  });
});

describe('sugerirPlan', () => {
  it('solo sugiere cultivos de la estación pedida', () => {
    const plan = motor.sugerirPlan({ season: 'summer', sunHours: 8, bedCount: 2 });
    expect(plan.length).toBeGreaterThan(0);
    for (const s of plan) {
      const cultivo = buscarCultivo(s.cropId);
      expect(cultivo?.seasons).toContain('summer');
    }
  });

  it('respeta las horas de sol', () => {
    const plan = motor.sugerirPlan({ season: 'spring', sunHours: 3, bedCount: 1 });
    for (const s of plan) {
      const cultivo = buscarCultivo(s.cropId);
      expect(cultivo?.sunNeed).toBe('shade');
    }
  });

  it('prioriza preferencias del usuario', () => {
    const plan = motor.sugerirPlan({
      season: 'spring',
      sunHours: 8,
      bedCount: 1,
      preferences: ['tomato'],
    });
    expect(plan[0]?.cropId).toBe('tomato');
  });

  it('acota la cantidad al número de camas', () => {
    const plan = motor.sugerirPlan({ season: 'spring', sunHours: 8, bedCount: 1 });
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  it('cada sugerencia incluye rationale no vacío', () => {
    const plan = motor.sugerirPlan({ season: 'fall', sunHours: 8, bedCount: 3 });
    for (const s of plan) {
      expect(s.rationale.length).toBeGreaterThan(0);
    }
  });

  it('ordena las sugerencias por puntaje (preferidas primero)', () => {
    const plan = motor.sugerirPlan({
      season: 'spring',
      sunHours: 8,
      bedCount: 2,
      preferences: ['radish'],
    });
    expect(plan[0]?.cropId).toBe('radish');
  });
});

describe('diagnosticar', () => {
  it('devuelve lista vacía sin síntomas', () => {
    expect(motor.diagnosticar(null, [])).toEqual([]);
  });

  it('diagnostica mildiu temprano en tomate con manchas marrones', () => {
    const resultados = motor.diagnosticar('tomato', ['brown_spots', 'yellowing']);
    expect(resultados[0]?.issueId).toBe('early_blight');
    expect(resultados[0]?.confidence).toBeGreaterThan(0.5);
  });

  it('sube la confianza cuando el cultivo coincide con la KB', () => {
    // early_blight incluye tomato en su lista de cultivos afectados.
    const conCultivo = motor.diagnosticar('tomato', ['brown_spots', 'yellowing']);
    const sinCultivo = motor.diagnosticar(null, ['brown_spots', 'yellowing']);
    expect(conCultivo[0]?.confidence).toBeGreaterThan(sinCultivo[0]?.confidence ?? 0);
  });

  it('devuelve máximo 3 candidatos', () => {
    const resultados = motor.diagnosticar(null, ['yellowing']);
    expect(resultados.length).toBeLessThanOrEqual(3);
  });

  it('cada resultado incluye acciones', () => {
    const resultados = motor.diagnosticar('cucumber', ['white_powder']);
    for (const r of resultados) {
      expect(r.actions.length).toBeGreaterThan(0);
    }
  });

  it('no devuelve resultados para síntomas inexistentes en la KB', () => {
    const sintomaInvalido = 'xyz' as unknown as TipoSintoma;
    expect(motor.diagnosticar(null, [sintomaInvalido])).toHaveLength(0);
  });

  it('agrupa múltiples diagnósticos candidatos para síntomas comunes', () => {
    const resultados = motor.diagnosticar('tomato', ['yellowing', 'wilting']);
    expect(resultados.length).toBeGreaterThan(1);
  });
});

describe('estacionActual', () => {
  it('mapea meses correctamente', () => {
    expect(motor.estacionActual(3)).toBe('spring');
    expect(motor.estacionActual(7)).toBe('summer');
    expect(motor.estacionActual(10)).toBe('fall');
    expect(motor.estacionActual(1)).toBe('winter');
  });

  it('funciona sin argumentos (usa la fecha actual)', () => {
    expect(motor.estacionActual()).toBeDefined();
  });
});
