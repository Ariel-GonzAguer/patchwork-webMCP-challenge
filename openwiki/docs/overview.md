# Project Documentation

## Existing documentation

### README.md

The project's main README (`README.md`) contains:
- Project description and purpose (WebMCP Challenge)
- Usage instructions for ChatGPT desktop and Chrome 149+
- Description of the 4 pages (Garden, Calendar, Diagnose, Learn)
- Table of the 6 WebMCP tools
- Justification for WebMCP in gardening
- Technology stack
- Setup and testing instructions
- Directory structure
- MIT license

### LICENSE

MIT license. The project is open source.

## Project conventions

### Spanish names

The project uses Spanish names for:
- Directories: `componentes/`, `paginas/`, `clases/`, `datos/`, `estilos/`, `tipos/`
- CSS files: `jardin.css`, `diagnostico.css`
- CSS classes: `.celda`, `.camas`, `.aviso`, `.chip`, `.tarea`
- Variables/functions: `manejarClicCelda`, `buscarCultivo`, `cultivoSeleccionado`
- Types: `EstadoJardin`, `Colocacion`, `Cultivo`, `MotorReglas`

English names:
- React components: `DetalleCultivo`, `RegistroActividad`, `Marco`
- User-visible UI: text, labels, navigation

### Strict TypeScript

The project uses the strictest TypeScript configuration:
- `strict: true`
- `noUncheckedIndexedAccess: true` — array index access returns `T | undefined`
- `exactOptionalPropertyTypes: true` — optional properties cannot be `undefined` unless explicitly declared
- `noImplicitAny: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### Testing

- 83 tests across 7 files
- Rules engine tests: 28 (largest block)
- WebMCP tests: 22 (second largest)
- UI tests: 14 (7 garden + 7 diagnosis)
- Data tests: 9
- Store tests: 9
- Smoke test: 1

## Development tools

| Tool | Command | Purpose |
|------|---------|---------|
| Dev server | `pnpm run dev` | Local development with HMR |
| Build | `pnpm run build` | Typecheck + production |
| Tests | `pnpm test` | 83-test suite |
| Lint | `pnpm run lint` | ESLint with type-checking |
| Format | `pnpm run format:check` | Check Prettier formatting |
| Deploy | `pnpm run deploy:netlify` | Full pipeline + deploy |

## References

- [Quickstart](../quickstart.md)
- [Architecture](../architecture/overview.md)
- [Development workflow](../development/workflow.md)
