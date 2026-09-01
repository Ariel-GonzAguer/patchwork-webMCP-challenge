# Data flow in PatchWork

PatchWork has a unidirectional data flow: actions (from the human or AI agent) mutate the Zustand store, and React components re-render automatically. There is no backend — everything persists to localStorage.

## General diagram

```
┌──────────────┐     ┌──────────────┐
│    Human     │     │   AI Agent   │
│  (UI click)  │     │ (WebMCP API) │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
  Components          registrarTools.ts
  React               (6 tools)
       │                    │
       ▼                    ▼
  ┌─────────────────────────────┐
  │     MotorReglas             │
  │  (pure TS validation)       │
  │  validarColocacion()        │
  │  diagnosticar()             │
  │  sugerirPlan()              │
  │  filtrarCultivos()          │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │   Zustand Store             │
  │   (jardin.ts)               │
  │                             │
  │  beds[]  tasks[]  log[]     │
  │  gardenName  sunHours       │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │   localStorage              │
  │   patchwork-jardin-v1       │
  └─────────────────────────────┘
```

## Flow 1: Planting a crop (human)

```
Click on empty cell (paginas/jardin/index.tsx)
  │
  ▼
manejarClicCelda(bed, x, y)
  │
  ├─ If cell occupied → store.retirar(bed, x, y, 'human', null, [], summary)
  │
  └─ If cell empty:
      │
      ▼
  MotorReglas.validarColocacion(existing, new, sunHours, 4, 6)
      │
      ├─ Returns Warning[] (may include antagonist, spacing, sun)
      │
      ▼
  store.colocar(bed, placement, 'human', null, warnings, summary)
      │
      ▼
  State updated → React re-renders grid
      │
      ▼
  EntradaLog added to log (actor: 'human')
```

## Flow 2: Planting a crop (AI agent via WebMCP)

```
Agent executes design_bed({ bed: 1, mode: 'add', placements: [...] })
  │
  ▼
registrarTools.ts → design_bed handler
  │
  ├─ Validates: bed ∈ [1,2], mode ∈ ['add','remove'], placements ≤ 24
  │
  ├─ For each placement:
  │   ├─ Validates crop_id exists in CULTIVOS
  │   ├─ Validates integer coordinates within bounds
  │   └─ MotorReglas.validarColocacion()
  │       ├─ If bounds/unknown_crop → ERROR (rejects placement)
  │       └─ If spacing/antagonist/sun → WARNING (applies but reports)
  │
  ▼
  store.colocar(bed, placement, 'agent', 'design_bed', warnings, summary)
  │
  ▼
  Returns { applied, warnings, errors, bedState }
  │
  ▼
  UI updates automatically (same store)
  EntradaLog added (actor: 'agent', tool: 'design_bed')
```

## Flow 3: Diagnosing a problem

```
User selects crop + toggles symptoms (paginas/diagnostico/index.tsx)
  │
  ▼
  MotorReglas.diagnosticar(cropId, activeSymptoms)
  │
  ├─ For each Problema in PROBLEMAS:
  │   ├─ Counts matching symptoms
  │   ├─ confidence = 0.35 + 0.5 * (matched/total)
  │   └─ If cropId matches problema.cropIds → +0.2 bonus
  │
  ├─ Sorts by confidence descending
  ├─ Takes top 3 results
  │
  ▼
  Returns ResultadoDiagnostico[] with:
    - name, severity, confidence (%), matchedSymptoms, actions
  │
  ▼
  UI renders result cards with severity badges
```

## Flow 4: Suggesting a planting plan

```
Agent executes suggest_plan({ season, sun_hours, bed_count, preferences })
  │
  ▼
  MotorReglas.sugerirPlan(options)
  │
  ├─ For each crop in CULTIVOS:
  │   ├─ score = 0
  │   ├─ If season matches crop's seasons → +3
  │   ├─ If sun_hours satisfies crop's need → +2
  │   ├─ If in preferences → +3
  │   ├─ If any already-planted crop is a companion → +1
  │   └─ Generates rationale[] with reasons
  │
  ├─ Sorts by score descending
  ├─ Takes top (bedCount * 4) suggestions
  │
  ▼
  Returns SugerenciaPlan[] with cropId, name, emoji, rationale
```

## Flow 5: Persistence

```
Any store mutation
  │
  ▼
  Zustand persist middleware
  │
  ├─ Serializes full state to JSON
  ├─ Saves to localStorage['patchwork-jardin-v1']
  │
  ▼
  On page reload:
  │
  ├─ Zustand reads localStorage
  ├─ Deserializes and restores state
  └─ UI renders with previous state
```

## Flow 6: Activity log (audit trail)

```
Any mutation (colocar, retirar, registrarTarea, registrarLog)
  │
  ▼
  EntradaLog added to log[] array
  │
  ├─ id: generated with timestamp + random
  ├─ actor: 'agent' | 'human'
  ├─ tool: WebMCP tool name (or null if human)
  ├─ message: action description
  ├─ timestamp: Date.now()
  └─ warningCount: number of associated warnings
  │
  ▼
  RegistroActividad component shows latest 40 entries
  in reverse chronological order
```

## Static data

The crop and problem catalogs are immutable data defined in `src/datos/`:

| File | Contents | Records |
|------|----------|---------|
| `cultivos.ts` | Crop catalog with companions, antagonists, spacing, seasons | 26 crops |
| `problemas.ts` | Disease/pest knowledge base with symptoms and actions | 14 problems |

Both export `readonly` arrays (with `as const`) and search-by-id functions (`buscarCultivo`, `buscarProblema`).

## References

- [Architecture overview](./overview.md)
- [Rules engine](../features/rules-engine.md)
- [WebMCP tools](../features/webmcp-tools.md)
- [Store and backend](../backend/overview.md)
- Source files: `src/store/jardin.ts`, `src/clases/MotorReglas.ts`, `src/webmcp/registrarTools.ts`
