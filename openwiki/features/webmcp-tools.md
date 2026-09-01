# WebMCP Tools

PatchWork exposes 6 WebMCP tools that let an AI agent (ChatGPT desktop or Chrome 149+) interact with the garden in a structured way. The tools read and write the same Zustand store as the UI, so the agent's actions are visible to the human in real time.

## What is WebMCP

WebMCP (Web Model Context Protocol) is a standard proposed by the W3C Web Machine Learning Community Group that lets websites register "tools" that language models can invoke directly from the browser. It's the web equivalent of MCP servers, but without a server — everything happens on the client.

## Why is it here

Gardening rules (companion planting, spacing, sun requirements, seasons) are deterministic. An agent trying to click on a visual grid is slow and error-prone. With WebMCP, the agent calls `design_bed` and gets back structured conflicts it can negotiate: *"potatoes and tomatoes are poor companions"* — then it adjusts. Planning becomes a conversation, not a guessing game.

## Tool registration

Tools are registered in `src/webmcp/registrarTools.ts` via the `registrarToolsWebmcp()` function. This function is called once from the `useWebmcp()` hook in `App.tsx`.

If `document.modelContext?.registerTool` doesn't exist (browser without WebMCP support), the function is a no-op — progressive enhancement pattern.

```ts
// src/webmcp/registrarTools.ts
export function webmcpDisponible(): boolean {
  return typeof document !== 'undefined'
    && typeof document.modelContext?.registerTool === 'function';
}

export async function registrarToolsWebmcp(): Promise<void> {
  if (!webmcpDisponible()) return;
  // registers the 6 tools...
}
```

## The 6 tools

### 1. `list_crops` (read)

Searches the crop catalog with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | No | Search text (matches name) |
| `sun_hours` | `number` | No | Available sun hours (filters by need) |
| `season` | `Estacion` | No | Season (`spring`, `summer`, `fall`, `winter`) |
| `min_space_cm` | `number` | No | Minimum available space in cm |

**Returns**: Array of `Cultivo` objects with all fields (id, name, emoji, sunNeed, spacingCm, seasons, companions, antagonists, daysToMaturity, waterNeeds).

**Agent usage example**: *"What crops can I plant in partial sun with 20cm spacing?"*

### 2. `get_garden_state` (read)

Returns a complete snapshot of the current garden state.

**Parameters**: none.

**Returns**:
```ts
{
  gardenName: string,
  sunHours: number,
  beds: { bed: number, placements: Colocacion[] }[],
  pendingTasks: number,
  recentLog: EntradaLog[]
}
```

Crops in each placement are enriched with the name and emoji from the catalog.

**Agent usage example**: *"What's currently planted in my garden?"*

### 3. `design_bed` (write)

Adds or removes crops on a garden bed. This is the most complex tool.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bed` | `number` | Yes | Bed number (1 or 2) |
| `mode` | `'add' \| 'remove'` | Yes | Action to perform |
| `placements` | `{ crop_id: string, x: number, y: number }[]` | Yes | List of placements (max 24) |

**Validations**:
- `bed` must be in [1, NUMERO_CAMAS]
- `mode` must be `'add'` or `'remove'`
- `placements` cannot be empty, maximum 24 elements
- Each `crop_id` must exist in the crop catalog
- Each coordinate must be an integer within grid bounds (0-3 x, 0-5 y)
- In `add` mode: cell must not be occupied, `MotorReglas.validarColocacion()` is executed
- In `remove` mode: cell must be occupied

**Returns**:
```ts
{
  applied: number,        // successfully applied placements
  warnings: Warning[],    // warnings (antagonist, spacing, sun)
  errors: string[],       // fatal errors (bounds, unknown_crop)
  bedState: string summary // "3 tomatoes, 2 basil"
}
```

Warnings of type `bounds` or `unknown_crop` reject the placement. Other warnings (`spacing`, `antagonist`, `sun`) apply the placement but report them.

**Agent usage example**: *"Plant tomatoes, basil and carrots in bed 1, spaced out nicely."*

### 4. `suggest_plan` (read)

Suggests a seasonal planting plan based on garden conditions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `season` | `Estacion` | No | Season (default: current season) |
| `sun_hours` | `number` | No | Sun hours (default: store's sunHours) |
| `bed_count` | `number` | No | Number of beds (default: 2) |
| `preferences` | `string[]` | No | User's preferred crops |

**Scoring algorithm**:
- Season matches crop's seasons → +3
- Sun hours satisfy crop's need → +2
- In preferences → +3
- Any already-planted crop is a companion → +1

**Returns**: Array of `SugerenciaPlan` with `cropId`, `name`, `emoji`, and `rationale[]` (reasons for the score).

**Agent usage example**: *"Suggest a planting plan for summer with full sun."*

### 5. `log_task` (write)

Adds a care task to the shared calendar.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `TipoTarea` | Yes | Type: `water`, `fertilize`, `harvest`, `prune`, `observe` |
| `crop_id` | `string` | No | Associated crop (must exist if provided) |
| `note` | `string` | No | Additional note (max 200 characters) |
| `due_day` | `number` | No | Due day (default: 0, must be >= 0) |

**Returns**: The logged task + count of pending tasks.

**Agent usage example**: *"Add a watering task for the tomatoes in 3 days."*

### 6. `diagnose_issue` (read)

Diagnoses plant problems based on observed symptoms.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `crop_id` | `string` | No | Affected crop (increases confidence if it matches) |
| `symptoms` | `TipoSintoma[]` | Yes | List of observed symptoms (minimum 1 valid) |

**Valid symptoms** (12): `yellowing`, `brown_spots`, `black_spots`, `wilting`, `holes`, `chewed`, `white_powder`, `sticky`, `curling`, `stunted`, `rot`, `mottled`.

**Confidence algorithm**:
```
confidence = 0.35 + 0.5 * (matching_symptoms / total_problem_symptoms)
if cropId matches problema.cropIds → +0.2 bonus
capped at 0.95
```

**Returns**: Top 3 `ResultadoDiagnostico` with `name`, `severity`, `confidence` (%), `matchedSymptoms`, and `actions[]`.

**Agent usage example**: *"My tomato leaves have brown spots and are yellowing. What's wrong?"*

## Annotations

Each tool is registered with annotations indicating its behavior:

| Tool | `readOnlyHint` | `untrustedContentHint` |
|------|---------------|----------------------|
| `list_crops` | `true` | `false` |
| `get_garden_state` | `true` | `false` |
| `design_bed` | `false` | `false` |
| `suggest_plan` | `true` | `false` |
| `log_task` | `false` | `false` |
| `diagnose_issue` | `true` | `false` |

## Shared engine instance

`registrarTools.ts` creates a singleton instance of `MotorReglas` at module level:

```ts
const motor = new MotorReglas();
```

This instance is used for `filtrarCultivos`, `validarColocacion`, `sugerirPlan`, and `diagnosticar` within the tool handlers.

## References

- [Rules engine](./rules-engine.md)
- [Diagnosis system](./diagnosis.md)
- [Data flow](../architecture/data-flow.md)
- [Zustand store](../backend/overview.md)
- Source file: `src/webmcp/registrarTools.ts`
- Types: `src/tipos/webmcp.d.ts`
