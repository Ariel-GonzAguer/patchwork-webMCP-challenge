import { describe, expect, it } from 'vitest';
import { CULTIVOS, buscarCultivo } from '../datos/cultivos';
import { PROBLEMAS, buscarProblema } from '../datos/problemas';

describe('catálogo de cultivos', () => {
  it('contiene al menos 24 cultivos', () => {
    expect(CULTIVOS.length).toBeGreaterThanOrEqual(24);
  });

  it('todos los ids son únicos', () => {
    const ids = CULTIVOS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todas las referencias a compañeras y antagonistas resuelven a cultivos reales', () => {
    const ids = new Set(CULTIVOS.map((c) => c.id));
    for (const cultivo of CULTIVOS) {
      for (const companera of cultivo.companions) {
        expect(ids.has(companera), `${cultivo.id} → ${companera}`).toBe(true);
      }
      for (const antagonista of cultivo.antagonists) {
        expect(ids.has(antagonista), `${cultivo.id} → ${antagonista}`).toBe(true);
      }
    }
  });

  it('buscarCultivo encuentra por id y devuelve undefined para desconocidos', () => {
    expect(buscarCultivo('tomato')?.name).toBe('Tomato');
    expect(buscarCultivo('no-existe')).toBeUndefined();
  });

  it('los cultivos tienen datos de horticultura plausibles', () => {
    for (const cultivo of CULTIVOS) {
      expect(cultivo.spacingCm).toBeGreaterThan(0);
      expect(cultivo.daysToMaturity).toBeGreaterThan(0);
      expect(cultivo.seasons.length).toBeGreaterThan(0);
    }
  });
});

describe('KB de problemas', () => {
  it('contiene al menos 14 problemas', () => {
    expect(PROBLEMAS.length).toBeGreaterThanOrEqual(14);
  });

  it('todos los ids son únicos y las referencias a cultivos resuelven', () => {
    const ids = new Set(PROBLEMAS.map((p) => p.id));
    expect(ids.size).toBe(PROBLEMAS.length);

    const idsCultivos = new Set(CULTIVOS.map((c) => c.id));
    for (const problema of PROBLEMAS) {
      if (problema.cropIds !== null) {
        for (const cropId of problema.cropIds) {
          expect(idsCultivos.has(cropId), `${problema.id} → ${cropId}`).toBe(true);
        }
      }
    }
  });

  it('todos los problemas tienen al menos 2 síntomas y acciones', () => {
    for (const problema of PROBLEMAS) {
      expect(problema.symptoms.length).toBeGreaterThanOrEqual(2);
      expect(problema.actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('buscarProblema encuentra por id', () => {
    expect(buscarProblema('aphids')?.name).toBe('Aphids');
    expect(buscarProblema('no-existe')).toBeUndefined();
  });
});
