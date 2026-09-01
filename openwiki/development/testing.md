# Testing in PatchWork

PatchWork has 83 tests organized in 7 files covering the rules engine, the store, the UI, and the WebMCP tools.

## Testing stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.1.11 | Test runner |
| @testing-library/react | 16.3.3 | React component testing |
| @testing-library/jest-dom | 7.0.1 | DOM matchers (toBeInTheDocument, etc.) |
| @testing-library/user-event | 14.6.6 | User interaction simulation |
| jsdom | 30.0.1 | Simulated DOM for tests |

## Configuration

**File**: `vitest.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"development"', // forces React 19 development builds
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    server: {
      deps: {
        inline: ['react', 'react-dom', 'react-dom/test-utils'],
      },
    },
  },
});
```

**Setup** (`src/tests/setup.ts`):
- Imports `@testing-library/jest-dom/vitest` for extended matchers
- Registers `cleanup()` in `afterEach` to clean DOM between tests

## Test inventory

| File | Tests | Category | Coverage |
|------|-------|----------|----------|
| `smoke.test.ts` | 1 | Infrastructure | Verifies test environment works |
| `datos.test.ts` | 9 | Data integrity | Crop catalog (26) and problem KB (14): unique IDs, valid references, plausible horticultural data |
| `motor-reglas.test.ts` | 28 | Business logic | MotorReglas: filter, validate, suggest, diagnose, season mapping |
| `jardin-store.test.ts` | 9 | State | Zustand store: place, remove, tasks, config, log, reset |
| `jardin-ui.test.tsx` | 7 | UI | Garden page: grids, plant, remove, warnings, detail, log |
| `diagnostico-ui.test.tsx` | 7 | UI | Diagnosis page: selector, chips, results, agent panel |
| `webmcp-tools.test.ts` | 22 | Integration | 6 WebMCP tools: registration, schemas, execution, errors |
| **TOTAL** | **83** | | |

## Detail per file

### `smoke.test.ts` (1 test)

Basic test verifying `expect(true).toBe(true)`. Serves as an environment sanity check.

### `datos.test.ts` (9 tests)

**Crop catalog** (5 tests):
- At least 24 crops exist
- All IDs are unique
- All companions and antagonists reference existing crops
- `buscarCultivo` works correctly
- Plausible horticultural data (spacing, maturity, seasons)

**Problem KB** (4 tests):
- At least 14 problems exist
- All IDs are unique
- All crop references are valid
- Each problem has at least 2 symptoms and 2 actions

### `motor-reglas.test.ts` (28 tests)

| Block | Tests | Coverage |
|-------|-------|----------|
| `horasASol` | 3 | full/partial/shade mapping |
| `filtrarCultivos` | 6 | Search by query, season, sun, space, combined |
| `validarColocacion` | 8 | Valid, unknown crop, out of bounds, occupied, sun, spacing, antagonists vs companions |
| `sugerirPlan` | 6 | Season, sun, preferences, bed cap, rationale, ordering |
| `diagnosticar` | 7 | Empty symptoms, early blight, crop boost, max 3, actions present, invalid, multiple candidates |
| `estacionActual` | 2 | Month to season mapping |

### `jardin-store.test.ts` (9 tests)

- Initial state: 2 empty beds
- `colocar` adds placement
- `colocar` logs with actor and warnings
- `retirar` removes only the target cell
- `registrarTarea` creates pending task
- `completarTarea` marks only the target task done
- `reiniciarJardin` resets everything
- `setSunHours` / `setGardenName` update config
- Log accumulates chronologically

### `jardin-ui.test.tsx` (7 tests)

- Renders 2 beds with 48 cells (2 x 4 x 6)
- Empty cells have accessible labels
- Click plants crop and shows emoji
- Antagonist warning appears as `role="alert"`
- Click on occupied cell removes crop
- Crop detail shows sun info
- Activity log shows agent entries

### `diagnostico-ui.test.tsx` (7 tests)

- Crop selector with at least 24 options
- Initial "select symptoms" message
- Chips have `aria-pressed`
- Early blight diagnosis from symptoms
- Chip toggle on/off
- Severity and percentage displayed
- "Ask your agent" panel with prompts

### `webmcp-tools.test.ts` (22 tests)

| Block | Tests | Coverage |
|-------|-------|----------|
| `registrarToolsWebmcp` | 3 | 6 tools registered, graceful degradation, readOnlyHint |
| `list_crops` | 3 | Season+sun filter, query, full catalog |
| `get_garden_state` | 1 | Reflects placements |
| `design_bed` | 6 | Valid placements, antagonists, unknown crop, bed range, agent logging, remove mode |
| `suggest_plan` | 4 | Season only, rationale, default season, preferences |
| `log_task` | 3 | Pending task, invalid type, unknown crop |
| `diagnose_issue` | 3 | Early blight, empty symptoms, invalid filtering |

## WebMCP testing pattern

WebMCP tests use a helper that installs a fake `document.modelContext`:

```ts
function instalarModelContextFake() {
  const tools: Map<string, WebmcpTool> = new Map();
  document.modelContext = {
    registerTool: async (tool) => { tools.set(tool.name, tool); },
    getTools: async () => [...tools.values()],
  };
  return tools;
}
```

This allows executing tools as a WebMCP-enabled browser would.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Runs all tests once |
| `pnpm test -- --watch` | Runs tests in watch mode |
| `pnpm test -- --reporter verbose` | Runs with detailed output |

## References

- [Linting](./linting.md)
- [Development workflow](./workflow.md)
- Source files: `src/tests/`, `vitest.config.ts`
