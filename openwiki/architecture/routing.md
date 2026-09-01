# Routing in PatchWork

PatchWork uses `@arielgonzaguer/michi-router` v3.3.2 as a lightweight SPA router. There is no server-side routing — all navigation happens on the client.

## Configuration

The router is configured in `src/App.tsx` via `<RouterProvider>`:

```tsx
<RouterProvider
  notFound={<h1>404 — Page not found</h1>}
>
  <Route path="/" element={<Jardin />} />
  <Route path="/calendario" element={<Calendario />} />
  <Route path="/diagnostico" element={<Diagnostico />} />
  <Route path="/aprender" element={<Aprender />} />
</RouterProvider>
```

## Route table

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `<Jardin />` | Interactive garden planner with 4x6 grids |
| `/calendario` | `<Calendario />` | Care task list with checkboxes |
| `/diagnostico` | `<Diagnostico />` | Problem diagnosis by symptoms |
| `/aprender` | `<Aprender />` | Documentation of the 6 WebMCP tools |
| *(any other)* | `<h1>404</h1>` | Page not found |

## Navigation

The `<Encabezado>` component (`src/componentes/encabezado/index.tsx`) renders 4 navigation links using `<Link>` from michi-router:

```tsx
<Link to="/">Garden</Link>
<Link to="/calendario">Calendar</Link>
<Link to="/diagnostico">Diagnose</Link>
<Link to="/aprender">Learn</Link>
```

## Scroll to top

The `<ScrollAlInicio>` component (`src/componentes/scroll-al-inicio/index.tsx`) uses `useLocation()` from michi-router to detect route changes and execute `window.scrollTo(0, 0)`. This ensures every navigation starts from the top of the page.

```tsx
const { pathname } = useLocation();
useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]);
```

## SPA redirect on Netlify

For routes to work when reloading the page on Netlify, `netlify.toml` includes an SPA redirect:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This makes Netlify serve `index.html` for any route that doesn't match a static file, allowing the client-side router to handle the route.

## References

- [Architecture overview](./overview.md)
- [Components](../components/overview.md)
- [Netlify deployment](../deployment/platform.md)
- Source file: `src/App.tsx`
