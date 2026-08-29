import { buscarCultivo, CULTIVOS } from '../datos/cultivos';
import { PROBLEMAS } from '../datos/problemas';
import type {
  Colocacion,
  CriteriosFiltro,
  Cultivo,
  Estacion,
  OpcionesPlan,
  ResultadoDiagnostico,
  SugerenciaPlan,
  TipoSintoma,
  Warning,
} from '../tipos/dominio';

/** Tamaño en centímetros de una celda del grid del huerto. */
const CM_POR_CELDA = 30;

export function horasASol(sunHours: number): Cultivo['sunNeed'] {
  if (sunHours >= 6) return 'full';
  if (sunHours >= 4) return 'partial';
  return 'shade';
}

function cumpleSol(cultivo: Cultivo, sunHours: number): boolean {
  const sol = horasASol(sunHours);
  if (sol === 'full') return true;
  if (sol === 'partial') return cultivo.sunNeed !== 'full';
  return cultivo.sunNeed === 'shade';
}

export class MotorReglas {
  filtrarCultivos(criterios: CriteriosFiltro = {}): Cultivo[] {
    const { query, sun_hours, season, min_space_cm } = criterios;

    return CULTIVOS.filter((cultivo) => {
      if (query && !cultivo.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (sun_hours !== undefined && !cumpleSol(cultivo, sun_hours)) {
        return false;
      }
      if (season !== undefined && !cultivo.seasons.includes(season)) {
        return false;
      }
      if (min_space_cm !== undefined && cultivo.spacingCm > min_space_cm) {
        return false;
      }
      return true;
    });
  }

  /**
   * Valida una colocación contra los límites del grid, la posición de los
   * vecinos, la compatibilidad entre cultivos y la luz disponible.
   */
  validarColocacion(
    colocacionesExistentes: readonly Colocacion[],
    nueva: Colocacion,
    sunHours: number,
    anchoGrid: number,
    altoGrid: number,
  ): Warning[] {
    const warnings: Warning[] = [];
    const cultivo = buscarCultivo(nueva.crop_id);

    if (!cultivo) {
      warnings.push({
        type: 'unknown_crop',
        message: `Unknown crop id "${nueva.crop_id}". Use list_crops to see valid ids.`,
        cropId: nueva.crop_id,
        severity: 'warning',
      });
      return warnings;
    }

    if (nueva.x < 0 || nueva.y < 0 || nueva.x >= anchoGrid || nueva.y >= altoGrid) {
      warnings.push({
        type: 'bounds',
        message: `${cultivo.name} at (${nueva.x}, ${nueva.y}) is outside the bed (grid ${anchoGrid}x${altoGrid}).`,
        cropId: cultivo.id,
        severity: 'warning',
      });
      return warnings;
    }

    const duplicado = colocacionesExistentes.some(
      (otra) => otra.x === nueva.x && otra.y === nueva.y,
    );
    if (duplicado) {
      warnings.push({
        type: 'duplicate',
        message: `Cell (${nueva.x}, ${nueva.y}) is already occupied.`,
        cropId: cultivo.id,
        severity: 'warning',
      });
    }

    if (!cumpleSol(cultivo, sunHours)) {
      warnings.push({
        type: 'sun',
        message: `${cultivo.name} needs ${cultivo.sunNeed} sun but the garden gets ${sunHours}h.`,
        cropId: cultivo.id,
        severity: 'warning',
      });
    }

    for (const otra of colocacionesExistentes) {
      const vecino = buscarCultivo(otra.crop_id);
      if (!vecino) continue;

      const distanciaMinimaCeldas = (cultivo.spacingCm + vecino.spacingCm) / 2 / CM_POR_CELDA;
      const distanciaReal = Math.max(
        Math.abs(otra.x - nueva.x),
        Math.abs(otra.y - nueva.y),
      );

      if (distanciaReal < distanciaMinimaCeldas) {
        warnings.push({
          type: 'spacing',
          message: `${cultivo.name} is too close to ${vecino.name} (needs ~${Math.ceil(distanciaMinimaCeldas)} cells apart).`,
          cropId: cultivo.id,
          severity: 'info',
        });
      }

      if (cultivo.antagonists.includes(vecino.id) || vecino.antagonists.includes(cultivo.id)) {
        warnings.push({
          type: 'antagonist',
          message: `${cultivo.name} and ${vecino.name} are poor companions.`,
          cropId: cultivo.id,
          severity: 'warning',
        });
      }
    }

    return warnings;
  }

  /**
   * Sugiere un plan de siembra para la estación: cultivos que crecen en esa
   * temporada y con esa luz, priorizando compañeras y preferencias del usuario.
   */
  sugerirPlan(opciones: OpcionesPlan): SugerenciaPlan[] {
    const { season, sunHours, bedCount, preferences } = opciones;
    const preferidos = new Set(preferences ?? []);

    const candidatos = CULTIVOS.filter(
      (cultivo) => cultivo.seasons.includes(season) && cumpleSol(cultivo, sunHours),
    );

    const puntuados = candidatos.map((cultivo) => {
      let puntaje = 0;
      const rationale: string[] = [];

      rationale.push(`Grows well in ${season}.`);
      puntaje += 3;

      if (cumpleSol(cultivo, sunHours)) {
        rationale.push(`Fits the ${sunHours}h sun exposure.`);
        puntaje += 2;
      }

      if (preferidos.has(cultivo.id) || preferidos.has(cultivo.name.toLowerCase())) {
        rationale.push('You asked for this one.');
        puntaje += 3;
      }

      const tieneCompanera = candidatos.some(
        (otro) => cultivo.companions.includes(otro.id) && otro !== cultivo,
      );
      if (tieneCompanera) {
        rationale.push('Has compatible companions in this season.');
        puntaje += 1;
      }

      return { cultivo, puntaje, rationale };
    });

    puntuados.sort((a, b) => b.puntaje - a.puntaje);

    const cantidad = Math.min(bedCount * 4, puntuados.length);

    return puntuados.slice(0, cantidad).map(({ cultivo, rationale }) => ({
      cropId: cultivo.id,
      name: cultivo.name,
      emoji: cultivo.emoji,
      rationale,
    }));
  }

  /**
   * Diagnostica a partir de síntomas y cultivo afectado. Devuelve candidatos
   * ordenados por confianza (top 3), con las acciones recomendadas.
   */
  diagnosticar(cropId: string | null, symptoms: readonly TipoSintoma[]): ResultadoDiagnostico[] {
    if (symptoms.length === 0) return [];

    const resultados = PROBLEMAS.filter((problema) => {
      const coincidencias = problema.symptoms.filter((sintoma) =>
        symptoms.includes(sintoma),
      );
      return coincidencias.length > 0;
    })
      .map((problema) => {
        const coincidencias = problema.symptoms.filter((sintoma) =>
          symptoms.includes(sintoma),
        );
        const ratio = coincidencias.length / problema.symptoms.length;
        let confianza = 0.35 + 0.5 * ratio;

        if (cropId && problema.cropIds?.includes(cropId)) {
          confianza += 0.2;
        }

        return {
          issueId: problema.id,
          name: problema.name,
          severity: problema.severity,
          confidence: Math.min(0.95, confianza),
          matchedSymptoms: coincidencias,
          actions: problema.actions,
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return resultados;
  }

  /**
   * Devuelve la estación actual para el hemisferio norte (modelo simple
   * de meses meteorológicos; suficiente para la demo).
   */
  estacionActual(mes: number = new Date().getMonth() + 1): Estacion {
    if (mes >= 3 && mes <= 5) return 'spring';
    if (mes >= 6 && mes <= 8) return 'summer';
    if (mes >= 9 && mes <= 11) return 'fall';
    return 'winter';
  }
}
