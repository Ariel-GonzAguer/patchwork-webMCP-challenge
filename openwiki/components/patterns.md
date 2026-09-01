# Component design patterns

## Naming conventions

- **Files**: Spanish names in kebab-case (`detalle-cultivo/`, `registro-actividad/`)
- **Components**: PascalCase in English in code (`DetalleCultivo`, `RegistroActividad`)
- **CSS classes**: Spanish names (`.celda`, `.camas`, `.aviso`, `.chip`, `.tarea`)
- **Props interfaces**: typed inline or as type alias in the same component file

## File structure per component

Each component lives in its own directory with an `index.tsx`:

```
componentes/
  detalle-cultivo/
    index.tsx
  encabezado/
    index.tsx
  indicador-webmcp/
    index.tsx
  marco/
    index.tsx
  registro-actividad/
    index.tsx
  scroll-al-inicio/
    index.tsx
```

Pages follow the same pattern but include their own CSS file:

```
paginas/
  jardin/
    index.tsx
    jardin.css
  calendario/
    index.tsx
    calendario.css
  diagnostico/
    index.tsx
    diagnostico.css
  aprender/
    index.tsx
    aprender.css
```

## Pattern: Layout shell (`Marco`)

All pages use `<Marco>` as a layout wrapper:

```tsx
export function Jardin() {
  return (
    <Marco>
      {/* page content */}
    </Marco>
  );
}
```

`Marco` renders `<Encabezado>` at the top and `<main className="contenido">` with the children.

## Pattern: Store consumption with selectors

Components that need state use `useJardinStore` with specific selectors to minimize re-renders:

```tsx
// In RegistroActividad
const log = useJardinStore((state) => state.log);

// In Jardin (multiple slices)
const beds = useJardinStore((state) => state.beds);
const sunHours = useJardinStore((state) => state.sunHours);
const colocar = useJardinStore((state) => state.colocar);
```

## Pattern: Validate before mutating

The `Jardin` component validates with `MotorReglas` before mutating the store:

```tsx
const motor = new MotorReglas();

function manejarClicCelda(cama: number, x: number, y: number) {
  const existente = beds[cama]?.find((c) => c.x === x && c.y === y);
  if (existente) {
    retirar(cama, x, y, 'human', null, [], `Removed ${existente.crop_id}`);
    return;
  }
  const nueva: Colocacion = { crop_id: cultivoSeleccionado, x, y };
  const warnings = motor.validarColocacion(beds[cama] ?? [], nueva, sunHours, ANCHO_GRID, ALTO_GRID);
  const errores = warnings.filter((w) => w.type === 'bounds' || w.type === 'unknown_crop');
  if (errores.length > 0) return;
  colocar(cama, nueva, 'human', null, warnings, `Planted ${cultivoSeleccionado}`);
}
```

## Pattern: Accessible grid rendering

The garden grid uses `<button>` elements with descriptive `aria-label` for each cell:

```tsx
<button
  key={`${x}-${y}`}
  className={`celda ${ocupado ? 'ocupada' : 'vacia'}`}
  aria-label={ocupado ? `${cultivo.name} at bed ${cama + 1}, row ${y + 1}, col ${x + 1}` : `Empty cell bed ${cama + 1}, row ${y + 1}, col ${x + 1}`}
  onClick={() => manejarClicCelda(cama, x, y)}
>
  {ocupado ? cultivo.emoji : ''}
</button>
```

## Pattern: Capability detection (progressive enhancement)

WebMCP is optional. The `useWebmcp` hook and `IndicadorWebmcp` component detect availability:

```tsx
// In useWebmcp.ts
useEffect(() => {
  registrarToolsWebmcp(); // no-op if WebMCP is not available
}, []);

// In indicador-webmcp/index.tsx
const disponible = typeof document !== 'undefined'
  && typeof document.modelContext?.registerTool === 'function';
```

## Pattern: Toggle chips for symptoms

The diagnosis page uses buttons with `aria-pressed` for selectable symptoms:

```tsx
<button
  className={`chip ${activos.has(sintoma) ? 'activo' : ''}`}
  aria-pressed={activos.has(sintoma)}
  onClick={() => alternarSintoma(sintoma)}
>
  {sintoma.replace(/_/g, ' ')}
</button>
```

## Accessibility

- All grid cells have descriptive `aria-label`
- Symptom chips use `aria-pressed` to indicate state
- Warnings render with `role="alert"`
- Color contrast follows the nature-inspired palette with semantic CSS variables
- `:focus-visible` with 3px green outline for keyboard navigation
- `accent-color` on checkboxes for theme consistency

## Theme system

The theme is applied automatically via `prefers-color-scheme: dark`. There is no manual toggle. The 16 CSS variables defined on `:root` are redefined in the media query for dark mode.

Key variables:

| Variable | Light | Dark | Use |
|----------|-------|------|-----|
| `--fondo` | `#f4f1e8` | `#161b14` | Page background |
| `--superficie` | `#ffffff` | `#1f271c` | Card background |
| `--texto` | `#23301f` | `#e6ecd9` | Primary text |
| `--acento` | `#2e7d32` | `#81c784` | Primary accent (green) |
| `--tierra` | `#8d6e63` | `#b08d7e` | Earth tone (human actor) |
| `--advertencia` | `#9a6700` | `#e2b93b` | Warning text |
| `--peligro` | `#b3261e` | `#ef9a9a` | Danger text |

## Responsive

Single breakpoint at `900px` (desktop-first, max-width):

- `jardin.css`: `grid-template-columns: 1fr 320px` → `1fr`
- `diagnostico.css`: `grid-template-columns: 1fr 300px` → `1fr`
- `aprender.css`: `auto-fit, minmax(280px, 1fr)` for tool cards
- Max container: `max-width: 1200px` with `margin: 0 auto`

## References

- [Component inventory](./overview.md)
- [Architecture](../architecture/overview.md)
- [UI testing](../development/testing.md)
- Source files: `src/componentes/`, `src/paginas/`, `src/estilos/global.css`
