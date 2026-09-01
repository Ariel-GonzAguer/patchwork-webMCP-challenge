# Utilities and Libraries

PatchWork uses a minimal set of dependencies. There is no `src/utils/` or `src/lib/` folder — logic is organized in `clases/` (rules engine), `datos/` (catalogs), and `store/` (state).

## Production dependencies

| Package | Version | Purpose | Where used |
|---------|---------|---------|------------|
| `react` | 19.2.8 | UI framework | All components |
| `react-dom` | 19.2.8 | DOM rendering | `main.tsx` |
| `zustand` | 5.0.15 | Global state with persistence | `store/jardin.ts` |
| `@arielgonzaguer/michi-router` | 3.3.2 | Lightweight SPA routing | `App.tsx`, `Encabezado`, `ScrollAlInicio` |

## Development dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~6.0.3 | TypeScript compiler |
| `vite` | 8.2.2 | Bundler and dev server |
| `@vitejs/plugin-react` | 6.1.1 | React plugin for Vite |
| `vitest` | 4.1.11 | Test runner |
| `jsdom` | 30.0.1 | Simulated DOM for tests |
| `@testing-library/react` | 16.3.3 | Component testing |
| `@testing-library/jest-dom` | 7.0.1 | DOM matchers |
| `@testing-library/user-event` | 14.6.6 | Interaction simulation |
| `eslint` | 10.9.1 | Linting |
| `typescript-eslint` | 8.68.0 | ESLint rules for TypeScript |
| `eslint-plugin-react-hooks` | 7.1.1 | Hooks rules |
| `eslint-plugin-react-refresh` | 0.5.5 | HMR safety |
| `@eslint/js` | 10.0.1 | ESLint base config |
| `globals` | 17.11.0 | Globals for ESLint |
| `prettier` | 3.9.6 | Code formatting |
| `@types/node` | 26.4.0 | Node.js types |
| `@types/react` | 19.2.18 | React types |
| `@types/react-dom` | 19.2.5 | React DOM types |

## Project helper functions

### In `MotorReglas.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `horasASol` | `(sunHours: number) => NecesidadSol` | Maps hours to sun category |
| `cumpleSol` (private) | `(cultivo: Cultivo, sunHours: number) => boolean` | Checks if sun satisfies crop |

### In `registrarTools.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `webmcpDisponible` | `() => boolean` | Detects WebMCP support |
| `registrarToolsWebmcp` | `() => Promise<void>` | Registers the 6 tools |
| `cultivoACatalogo` (private) | `(cultivoId: string) => object` | Enriches crop with companion/antagonist names |
| `esEntero` (private) | `(valor, min, max) => boolean` | Integer range validation |

### In `cultivos.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `buscarCultivo` | `(id: string) => Cultivo \| undefined` | Looks up crop by ID |

### In `problemas.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `buscarProblema` | `(id: string) => Problema \| undefined` | Looks up problem by ID |

### In `store/jardin.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `generarId` (private) | `() => string` | Generates unique ID with timestamp + random |
| `estadoInicial` (private) | `() => EstadoJardin` | Factory for default state |
| `seleccionarLog` | `(estado: EstadoJardin) => EntradaLog[]` | Selector for log slice |

## References

- [Architecture](../architecture/overview.md)
- Source files: `package.json`
