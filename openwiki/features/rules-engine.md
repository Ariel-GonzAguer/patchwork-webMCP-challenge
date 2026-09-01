# Rules Engine (MotorReglas)

The rules engine is a pure TypeScript class that implements all of PatchWork's business logic: crop filtering, placement validation, plan suggestion, and problem diagnosis. It has no dependencies on React or the store — it's a piece of pure logic that can be tested in isolation.

## Location and architecture

**File**: `src/clases/MotorReglas.ts`

**Dependencies**:
- `CULTIVOS` and `buscarCultivo` from `src/datos/cultivos.ts`
- `PROBLEMAS` from `src/datos/problemas.ts`
- Types from `src/tipos/dominio.ts`

**Internal constant**: `CM_POR_CELDA = 30` — each grid cell represents 30cm of real space.

## Exported helper function

### `horasASol(sunHours: number): NecesidadSol`

Maps sun hours to a need category:

| Hours | Result |
|-------|--------|
| >= 6 | `'full'` |
| >= 4 | `'partial'` |
| < 4 | `'shade'` |

## Class methods

### `filtrarCultivos(criterios?: CriteriosFiltro): Cultivo[]`

Filters the 26-crop catalog by optional criteria.

| Criterion | Type | Behavior |
|-----------|------|----------|
| `query` | `string` | Substring search on name (case-insensitive) |
| `sun_hours` | `number` | Filters by crops whose sun need is satisfied by the given hours |
| `season` | `Estacion` | Filters by crops that grow in that season |
| `min_space_cm` | `number` | Filters by crops whose spacing is <= the minimum space |

All filters are cumulative (AND). Without criteria, returns all 26 crops.

### `validarColocacion(existingPlacements, newPlacement, sunHours, gridWidth, gridHeight): Warning[]`

Validates a new placement against 6 rules. Returns a list of warnings.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `existingPlacements` | `Colocacion[]` | Crops already planted in the bed |
| `newPlacement` | `Colocacion` | Placement to validate |
| `sunHours` | `number` | Garden's sun hours |
| `gridWidth` | `number` | Grid columns (default: 4) |
| `gridHeight` | `number` | Grid rows (default: 6) |

**Validation rules**:

| # | Warning type | Severity | Fatal? | Rule |
|---|-------------|----------|--------|------|
| 1 | `unknown_crop` | warning | Yes | crop_id must exist in CULTIVOS |
| 2 | `bounds` | warning | Yes | x must be in [0, gridWidth), y in [0, gridHeight) |
| 3 | `duplicate` | warning | No | Cell must not be occupied |
| 4 | `sun` | warning | No | Crop's sun need must be satisfied |
| 5 | `spacing` | warning | No | Chebyshev distance to neighbors >= average spacing / 2 / 30cm |
| 6 | `antagonist` | warning | No | No neighbor must be an antagonist of the crop (nor vice versa) |

**Chebyshev distance**: `max(|x1-x2|, |y1-y2|)`. This measures distance in cells considering diagonals.

**Returns early** on `unknown_crop` or `bounds` (fatal errors). The rest are cumulative.

### `sugerirPlan(options: OpcionesPlan): SugerenciaPlan[]`

Generates planting suggestions based on scoring.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `season` | `Estacion` | Target season |
| `sunHours` | `number` | Available sun hours |
| `bedCount` | `number` | Number of beds |
| `preferences` | `string[]` | Preferred crops (optional) |

**Scoring algorithm**:

| Condition | Points |
|-----------|--------|
| Season matches crop's `seasons` | +3 |
| Sun hours satisfy need | +2 |
| Crop is in `preferences` | +3 |
| Any already-planted crop is a companion | +1 |

**Returns**: Top `bedCount * 4` crops sorted by score descending, each with `rationale[]` explaining the score reasons.

### `diagnosticar(cropId: string | null, symptoms: TipoSintoma[]): ResultadoDiagnostico[]`

Diagnoses plant problems based on symptoms.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `cropId` | `string \| null` | Affected crop (optional, increases confidence) |
| `symptoms` | `TipoSintoma[]` | Observed symptoms |

**Confidence algorithm**:

```
base = 0.35
matched_ratio = matching_symptoms / total_problem_symptoms
confidence = base + 0.5 * matched_ratio
if cropId is in problema.cropIds → confidence += 0.2
confidence = min(confidence, 0.95)
```

**Returns**: Top 3 problems sorted by confidence descending, each with:
- `issueId`, `name`, `severity`
- `confidence` (0-1, displayed as %)
- `matchedSymptoms` (symptoms that matched)
- `actions[]` (recommended actions)

### `estacionActual(mes?: number): Estacion`

Maps a month (1-12) to the meteorological season (Northern Hemisphere).

| Months | Season |
|--------|--------|
| 3, 4, 5 | `spring` |
| 6, 7, 8 | `summer` |
| 9, 10, 11 | `fall` |
| 12, 1, 2 | `winter` |

Default: current month (`new Date().getMonth() + 1`).

## Where it's used

| Consumer | Methods used |
|----------|-------------|
| `Jardin` page | `validarColocacion()` to validate user clicks |
| `Diagnostico` page | `diagnosticar()` for symptom analysis |
| `registrarTools.ts` | `filtrarCultivos()`, `validarColocacion()`, `sugerirPlan()`, `diagnosticar()` |
| `motor-reglas.test.ts` tests | 28 tests covering all methods |

## Domain data

### Crop catalog (26 entries)

Each crop has: `id`, `name`, `emoji`, `sunNeed`, `spacingCm`, `seasons[]`, `companions[]`, `antagonists[]`, `daysToMaturity`, `waterNeeds`.

Example:
```ts
{
  id: 'tomato',
  name: 'Tomato',
  emoji: '🍅',
  sunNeed: 'full',
  spacingCm: 60,
  seasons: ['spring', 'summer'],
  companions: ['basil', 'carrot', 'marigold', 'nasturtium', 'onion'],
  antagonists: ['potato', 'corn', 'fennel'],
  daysToMaturity: 80,
  waterNeeds: 'medium'
}
```

### Problem knowledge base (14 entries)

Each problem has: `id`, `name`, `symptoms[]`, `cropIds[]` (null = any crop), `severity`, `actions[]`.

Example:
```ts
{
  id: 'early_blight',
  name: 'Early Blight',
  symptoms: ['brown_spots', 'yellowing', 'wilting'],
  cropIds: ['tomato', 'potato', 'pepper'],
  severity: 'high',
  actions: ['Remove affected leaves', 'Apply copper fungicide', 'Improve air circulation']
}
```

## References

- [WebMCP tools](./webmcp-tools.md)
- [Diagnosis system](./diagnosis.md)
- [Data catalog](../backend/overview.md)
- Source file: `src/clases/MotorReglas.ts`
- Tests: `src/tests/motor-reglas.test.ts` (28 tests)
