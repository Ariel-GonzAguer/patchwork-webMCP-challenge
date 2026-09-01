# Development Workflow

## Prerequisites

| Tool | Minimum version | Purpose |
|------|----------------|---------|
| Node.js | 22 | Runtime |
| pnpm | 9+ | Package manager |
| Git | 2.x | Version control |

## Initial setup

```bash
git clone <repo-url>
cd patchwork
pnpm install
pnpm run dev
```

Vite's dev server starts at `http://localhost:5173` (or the next available port).

## Available commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `pnpm run dev` | Dev server with HMR | Local development |
| `pnpm run build` | Typecheck + production build | Verify it compiles |
| `pnpm run preview` | Serve production build locally | Test local build |
| `pnpm test` | Run 83 tests | Verify changes |
| `pnpm run lint` | Run ESLint | Verify quality |
| `pnpm run lint:fix` | ESLint with auto-fix | Fix warnings |
| `pnpm run format:check` | Check Prettier formatting | Pre-commit |
| `pnpm run format:fix` | Format with Prettier | Fix formatting |
| `pnpm run deploy:netlify` | Full pipeline + deploy | Deploy to production |

## Typical workflow

```
1. pnpm run dev          ← start dev server
2. Make changes
3. pnpm test             ← verify tests pass
4. pnpm run build        ← verify typecheck + build
5. pnpm run lint         ← verify linting
6. Git commit + push
7. Netlify auto-deploy   ← (or pnpm run deploy:netlify for manual)
```

## Source file structure

```
src/
├── main.tsx              ← Entry point (ReactDOM.createRoot)
├── App.tsx               ← Router + WebMCP hook
├── clases/
│   └── MotorReglas.ts    ← Rules engine (pure logic)
├── componentes/
│   ├── detalle-cultivo/  ← Crop detail card
│   ├── encabezado/       ← Header with navigation
│   ├── indicador-webmcp/ ← WebMCP status badge
│   ├── marco/            ← Layout shell
│   ├── registro-actividad/ ← Activity log
│   └── scroll-al-inicio/ ← Scroll to top on navigation
├── datos/
│   ├── cultivos.ts       ← 26-crop catalog
│   └── problemas.ts      ← 14-problem KB
├── estilos/
│   └── global.css        ← Themes, CSS variables, reset
├── hooks/
│   └── useWebmcp.ts      ← WebMCP registration hook
├── paginas/
│   ├── calendario/       ← Tasks page
│   ├── diagnostico/      ← Diagnosis page
│   ├── aprender/         ← WebMCP docs page
│   └── jardin/           ← Main garden page
├── store/
│   └── jardin.ts         ← Zustand store (persist to localStorage)
├── tests/
│   ├── setup.ts          ← Testing Library setup
│   ├── smoke.test.ts     ← Sanity check
│   ├── datos.test.ts     ← Data tests
│   ├── motor-reglas.test.ts ← Engine tests
│   ├── jardin-store.test.ts ← Store tests
│   ├── jardin-ui.test.tsx   ← Garden UI tests
│   ├── diagnostico-ui.test.tsx ← Diagnosis UI tests
│   └── webmcp-tools.test.ts   ← WebMCP tests
├── tipos/
│   ├── dominio.ts        ← Domain types and enums
│   ├── jardin.ts         ← Store types and grid constants
│   ├── webmcp.d.ts       ← WebMCP API declarations
│   └── vite-env.d.ts     ← Vite types reference
└── webmcp/
    └── registrarTools.ts ← 6 WebMCP tool registration
```

## Conventions

- **File names**: Spanish in kebab-case (`detalle-cultivo/`, `registro-actividad/`)
- **Component names**: PascalCase in English (`DetalleCultivo`, `RegistroActividad`)
- **Variable/function names**: camelCase in Spanish (`manejarClicCelda`, `buscarCultivo`)
- **Types**: PascalCase in Spanish (`EstadoJardin`, `Colocacion`, `Cultivo`)
- **CSS**: Spanish class names (`.celda`, `.camas`, `.aviso`)
- **Tests**: `.test.ts` or `.test.tsx` suffix, Spanish for descriptions

## References

- [Testing](./testing.md)
- [Linting](./linting.md)
- [Architecture](../architecture/overview.md)
