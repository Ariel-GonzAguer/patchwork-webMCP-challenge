export type Estacion = 'spring' | 'summer' | 'fall' | 'winter';
export type NecesidadSol = 'full' | 'partial' | 'shade';
export type NecesidadAgua = 'low' | 'medium' | 'high';

export const ESTACIONES = ['spring', 'summer', 'fall', 'winter'] as const;
export const NECESIDADES_SOL = ['full', 'partial', 'shade'] as const;
export const NECESIDADES_AGUA = ['low', 'medium', 'high'] as const;

export interface Cultivo {
  id: string;
  name: string;
  emoji: string;
  sunNeed: NecesidadSol;
  spacingCm: number;
  seasons: Estacion[];
  companions: string[];
  antagonists: string[];
  daysToMaturity: number;
  waterNeeds: NecesidadAgua;
}

export interface CriteriosFiltro {
  query?: string;
  sun_hours?: number;
  season?: Estacion;
  min_space_cm?: number;
}

export interface Colocacion {
  crop_id: string;
  x: number;
  y: number;
}

export type TipoWarning = 'bounds' | 'unknown_crop' | 'duplicate' | 'sun' | 'spacing' | 'antagonist';

export interface Warning {
  type: TipoWarning;
  message: string;
  cropId: string;
  severity: 'info' | 'warning';
}

export type TipoSintoma =
  | 'yellowing'
  | 'brown_spots'
  | 'black_spots'
  | 'wilting'
  | 'holes'
  | 'chewed'
  | 'white_powder'
  | 'sticky'
  | 'curling'
  | 'stunted'
  | 'rot'
  | 'mottled';

export const SINTOMAS = [
  'yellowing',
  'brown_spots',
  'black_spots',
  'wilting',
  'holes',
  'chewed',
  'white_powder',
  'sticky',
  'curling',
  'stunted',
  'rot',
  'mottled',
] as const;

export interface Problema {
  id: string;
  name: string;
  symptoms: TipoSintoma[];
  cropIds: string[] | null;
  severity: 'low' | 'medium' | 'high';
  actions: string[];
}

export interface ResultadoDiagnostico {
  issueId: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  matchedSymptoms: TipoSintoma[];
  actions: string[];
}

export interface OpcionesPlan {
  season: Estacion;
  sunHours: number;
  bedCount: number;
  preferences?: string[];
}

export interface SugerenciaPlan {
  cropId: string;
  name: string;
  emoji: string;
  rationale: string[];
}

export type TipoTarea = 'water' | 'fertilize' | 'harvest' | 'prune' | 'observe';

export const TIPOS_TAREA = ['water', 'fertilize', 'harvest', 'prune', 'observe'] as const;
