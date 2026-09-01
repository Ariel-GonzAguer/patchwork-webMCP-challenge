# PatchWork Component System

PatchWork has 11 React components: 7 reusable in `src/componentes/` and 4 pages in `src/paginas/`. All are functional components with no classes.

## Full inventory

### Reusable components (`src/componentes/`)

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `Marco` | `marco/index.tsx` | `{ children: ReactNode }` | Layout shell: renders `<Encabezado>` + `<main>` with children |
| `Encabezado` | `encabezado/index.tsx` | *(none)* | Header with brand, navigation (4 links), and WebMCP indicator |
| `IndicadorWebmcp` | `indicador-webmcp/index.tsx` | *(none)* | Badge showing whether WebMCP is available in the browser |
| `DetalleCultivo` | `detalle-cultivo/index.tsx` | `{ cultivoId: string }` | Card with crop details: sun, spacing, water, maturity, seasons, companions, antagonists |
| `RegistroActividad` | `registro-actividad/index.tsx` | *(none)* | Sidebar panel with the latest 40 activity log entries |
| `ScrollAlInicio` | `scroll-al-inicio/index.tsx` | *(none)* | Side-effect: scrolls to (0,0) on every route change |

### Pages (`src/paginas/`)

| Page | File | Route | Purpose |
|------|------|-------|---------|
| `Jardin` | `jardin/index.tsx` | `/` | Interactive planner with 4x6 grids, crop selector, real-time validation |
| `Calendario` | `calendario/index.tsx` | `/calendario` | Care task list (water, fertilize, harvest, prune, observe) with checkboxes |
| `Diagnostico` | `diagnostico/index.tsx` | `/diagnostico` | Crop selector + symptom chips → diagnosis results with confidence and actions |
| `Aprender` | `aprender/index.tsx` | `/aprender` | Documentation of the 6 WebMCP tools with prompt examples |

## Dependency graph

```
main.tsx
 └─ App.tsx
     ├─ useWebmcp() → registrarTools.ts → store + MotorReglas
     ├─ ScrollAlInicio (useLocation)
     └─ RouterProvider
         ├─ Jardin (/)
         │   ├─ Marco → Encabezado → [Link x4, IndicadorWebmcp]
         │   ├─ DetalleCultivo ← buscarCultivo()
         │   ├─ RegistroActividad ← useJardinStore(log)
         │   └─ MotorReglas (validation)
         │
         ├─ Calendario (/calendario)
         │   ├─ Marco → Encabezado → IndicadorWebmcp
         │   └─ useJardinStore(tasks, completarTarea, gardenName)
         │
         ├─ Diagnostico (/diagnostico)
         │   ├─ Marco → Encabezado → IndicadorWebmcp
         │   └─ MotorReglas.diagnosticar()
         │
         └─ Aprender (/aprender)
             ├─ Marco → Encabezado → IndicadorWebmcp
             └─ webmcpDisponible()
```

## Store consumption

| Component | Store slices used |
|-----------|-------------------|
| `Jardin` | `beds`, `sunHours`, `gardenName`, `setSunHours`, `setGardenName`, `colocar`, `retirar` |
| `Calendario` | `tasks`, `completarTarea`, `gardenName` |
| `RegistroActividad` | `log` |
| `registrarTools.ts` | full `getState()`, `colocar`, `retirar`, `registrarTarea`, `registrarLog` |

The remaining components (`Marco`, `Encabezado`, `IndicadorWebmcp`, `DetalleCultivo`, `ScrollAlInicio`, `Diagnostico`, `Aprender`) do not consume the store directly.

## References

- [Design patterns](./patterns.md)
- [Architecture overview](../architecture/overview.md)
- [Data flow](../architecture/data-flow.md)
