# PatchWork Architecture Overview

PatchWork is a shared urban gardening SPA where humans and AI agents collaborate, built with React 19, strict TypeScript, and Zustand for global state. It has no backend — all logic runs in the browser and state persists to localStorage.

## Technology stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | 19.2.8 | UI with functional components |
| Language | TypeScript | ~6.0.3 | Strict typing (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| Bundler | Vite | 8.2.2 | Fast dev server and production build |
| State | Zustand | 5.0.15 | Global store with localStorage persistence |
| Routing | @arielgonzaguer/michi-router | 3.3.2 | Lightweight SPA routing |
| Testing | Vitest + Testing Library | 4.1.11 / 16.3.3 | 83 tests: engine, store, UI, WebMCP |
| Linting | ESLint + typescript-eslint | 10.9.1 / 8.68.0 | Strict rules with type-checking |
| Formatting | Prettier | 3.9.6 | Consistent formatting |
| Deployment | Netlify | — | Static SPA with redirect to index.html |

## Layer diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
├─────────────────────────────────────────────────────────┤
│  WebMCP API (Chrome 149+ / ChatGPT desktop)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ registrarTools.ts → 6 WebMCP tools                │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │ reads/writes                  │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ Zustand Store (jardin.ts)                         │  │
│  │ beds[] │ tasks[] │ log[] │ gardenName │ sunHours  │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │ renders                       │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ React Components                                  │  │
│  │ App → RouterProvider → [Jardin, Calendario,       │  │
│  │        Diagnostico, Aprender]                     │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │ validates                     │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ MotorReglas (pure TS class)                       │  │
│  │ filter │ validate │ suggest │ diagnose            │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │ reads                         │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ Static Data                                       │  │
│  │ cultivos.ts (26 crops) │ problemas.ts (14 KB)     │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  localStorage (patchwork-jardin-v1)                     │
└─────────────────────────────────────────────────────────┘
```

## Project directories

| Directory | Contents | Key files |
|-----------|----------|-----------|
| `src/clases/` | Rules engine (pure TypeScript class) | `MotorReglas.ts` |
| `src/componentes/` | Reusable UI components (6) | `marco/`, `encabezado/`, `detalle-cultivo/`, `registro-actividad/`, `indicador-webmcp/`, `scroll-al-inicio/` |
| `src/datos/` | Static catalogs | `cultivos.ts` (26 crops), `problemas.ts` (14 problems) |
| `src/estilos/` | Global CSS and themes | `global.css` (16 CSS variables, light/dark) |
| `src/hooks/` | Custom React hooks | `useWebmcp.ts` |
| `src/paginas/` | Application pages (4) | `jardin/`, `calendario/`, `diagnostico/`, `aprender/` |
| `src/store/` | Zustand global state | `jardin.ts` (persist to localStorage) |
| `src/tests/` | Test suite (83 tests) | 7 test files |
| `src/tipos/` | TypeScript type definitions | `dominio.ts`, `jardin.ts`, `webmcp.d.ts` |
| `src/webmcp/` | WebMCP tool registration | `registrarTools.ts` (6 tools) |
| `scripts/` | Deployment scripts | `deploy-netlify.sh` |

## Architectural decisions

**No backend**: All logic is deterministic and runs on the client. There are no LLM calls or external APIs. The rules engine evaluates companion planting, spacing, sun requirements, and seasons purely locally.

**Local persistence**: Zustand with `persist` middleware syncs all state to localStorage under the key `patchwork-jardin-v1`. This means the garden survives page reloads but is not shared across devices.

**WebMCP as integration layer**: The 6 WebMCP tools read and write the same store as the UI. When an AI agent executes `design_bed`, the grid updates in real time for the human. This is possible because both share the same Zustand instance.

**Separate rules engine**: `MotorReglas` is a pure class with no dependencies on React or the store. This allows testing all business logic in isolation and reusing it from both components and WebMCP tools.

## References

- [Routing](./routing.md)
- [Data flow](./data-flow.md)
- [Rules engine](../features/rules-engine.md)
- [WebMCP tools](../features/webmcp-tools.md)
- [Store and data](../backend/overview.md)
