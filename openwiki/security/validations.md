# Input Validation

PatchWork validates all inputs at two layers: the rules engine (for the UI) and the WebMCP tools (for the AI agent). Both layers use the same underlying engine.

## Layer 1: Rules engine (`MotorReglas.validarColocacion`)

When the user clicks on a grid cell, the `Jardin` component runs validation before mutating the store.

### Validated rules

| Rule | Warning type | Fatal | Validation |
|------|-------------|-------|------------|
| Unknown crop | `unknown_crop` | Yes | `buscarCultivo(crop_id)` must return a crop |
| Out of bounds | `bounds` | Yes | `x` in [0, ANCHO_GRID), `y` in [0, ALTO_GRID) |
| Duplicate cell | `duplicate` | No | No existing placement has the same coordinates |
| Insufficient sun | `sun` | No | `horasASol(sunHours)` satisfies `cultivo.sunNeed` |
| Insufficient spacing | `spacing` | No | Chebyshev distance to neighbors >= `spacingCm / 2 / 30` |
| Nearby antagonist | `antagonist` | No | No neighbor is in `cultivo.antagonists` nor vice versa |

### Fatal error behavior

If validation returns a warning of type `bounds` or `unknown_crop`, the component rejects the placement and does not mutate the store. Other warnings are cumulative — the placement is applied but warnings are shown to the user and logged.

```tsx
// src/paginas/jardin/index.tsx
const warnings = motor.validarColocacion(beds[cama] ?? [], nueva, sunHours, ANCHO_GRID, ALTO_GRID);
const errores = warnings.filter((w) => w.type === 'bounds' || w.type === 'unknown_crop');
if (errores.length > 0) return; // reject
colocar(cama, nueva, 'human', null, warnings, summary); // apply with warnings
```

## Layer 2: WebMCP tools (`registrarTools.ts`)

WebMCP tools receive input from the AI agent and must validate it robustly before mutating the store.

### `design_bed`

| Input | Validation | Error |
|-------|-----------|-------|
| `bed` | Must be integer in [1, NUMERO_CAMAS] | `"bed must be between 1 and {NUMERO_CAMAS}"` |
| `mode` | Must be `'add'` or `'remove'` | `"mode must be 'add' or 'remove'"` |
| `placements` | Non-empty array, max 24 elements | `"placements must be a non-empty array (max 24)"` |
| `crop_id` (each placement) | Must exist in CULTIVOS | `"Unknown crop: {id}"` |
| `x`, `y` (each placement) | Integers within grid bounds | `"Invalid coordinates"` |
| Occupied cell (add) | No existing placement | `"Cell already occupied"` |
| Empty cell (remove) | Must have existing placement | `"No crop at ({x},{y})"` |

Additional validations with `MotorReglas.validarColocacion()` in add mode:
- `bounds` and `unknown_crop` → error (rejects placement)
- `spacing`, `antagonist`, `sun` → warning (applies but reports)

### `log_task`

| Input | Validation | Error |
|-------|-----------|-------|
| `type` | Must be in `TIPOS_TAREA` (`water`, `fertilize`, `harvest`, `prune`, `observe`) | `"Invalid task type"` |
| `crop_id` | If provided, must exist in CULTIVOS | `"Unknown crop"` |
| `note` | Truncated to 200 characters | *(silent, no error)* |
| `due_day` | Integer >= 0 | `"due_day must be a non-negative integer"` |

### `diagnose_issue`

| Input | Validation | Error |
|-------|-----------|-------|
| `symptoms` | Filters values not in `SINTOMAS` | Invalid symptoms silently discarded |
| `symptoms` (after filtering) | At least 1 valid symptom must remain | `"At least one valid symptom required"` |

### `list_crops`

| Input | Validation | Error |
|-------|-----------|-------|
| `sun_hours` | If provided, must be integer in [0, 24] | *(silent, ignored if invalid)* |
| `min_space_cm` | If provided, must be integer > 0 | *(silent, ignored if invalid)* |

### `suggest_plan`

| Input | Validation | Error |
|-------|-----------|-------|
| `season` | If provided, must be in `ESTACIONES` | Defaults to `estacionActual()` if invalid |
| `sun_hours` | If provided, integer in [0, 24] | Defaults to `store.sunHours` if invalid |
| `bed_count` | If provided, integer > 0 | Defaults to 2 if invalid |

## Validation helper function

`registrarTools.ts` uses a private function to validate integers in ranges:

```ts
function esEntero(valor: unknown, min: number, max: number): valor is number {
  return typeof valor === 'number'
    && Number.isInteger(valor)
    && valor >= min
    && valor <= max;
}
```

## String truncation

The `log_task` tool truncates the note to 200 characters to prevent excessive localStorage usage:

```ts
const nota = typeof input.note === 'string' ? input.note.slice(0, 200) : null;
```

## References

- [Rules engine](../features/rules-engine.md)
- [WebMCP tools](../features/webmcp-tools.md)
- [Security implementation](./implementation.md)
- Source files: `src/clases/MotorReglas.ts`, `src/webmcp/registrarTools.ts`
