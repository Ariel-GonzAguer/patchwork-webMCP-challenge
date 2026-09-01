# Security Implementation in PatchWork

PatchWork is a static SPA with no backend, which significantly reduces the attack surface. There is no authentication, no databases, and no external API calls. Security focuses on HTTP headers, content policies, and input validation.

## Security model

```
┌─────────────────────────────────────────────┐
│              Browser (Client)               │
├─────────────────────────────────────────────┤
│  Netlify CDN                                 │
│  ├─ Security headers (CSP, HSTS, etc.)      │
│  ├─ Immutable cache for hashed assets       │
│  └─ No-cache for HTML                       │
├─────────────────────────────────────────────┤
│  React Application                           │
│  ├─ Input validation in MotorReglas         │
│  ├─ Input validation in WebMCP tools        │
│  ├─ No secrets in code                      │
│  └─ No external API calls                   │
├─────────────────────────────────────────────┤
│  localStorage                                │
│  └─ Only garden data (non-sensitive)        │
└─────────────────────────────────────────────┘
```

## Implemented measures

### 1. Security HTTP headers

Configured in `netlify.toml` for all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unnecessary permissions |
| `Content-Security-Policy` | *(see below)* | Restricts resource origins |

### 2. Content Security Policy (CSP)

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Same-origin resources only |
| `script-src` | `'self'` | Own scripts only |
| `style-src` | `'self' 'unsafe-inline'` | Own styles + inline (required for React) |
| `img-src` | `'self' data:` | Own images + data URIs (favicon SVG) |
| `connect-src` | `'self'` | No external API calls |
| `object-src` | `'none'` | No plugins (Flash, Java) |
| `frame-ancestors` | `'none'` | Cannot be embedded (anti-clickjacking) |

### 3. Input validation

**In `MotorReglas.validarColocacion()`**:
- Verifies crop_id exists in the catalog
- Verifies coordinates are within grid bounds
- Verifies cell is not occupied

**In `registrarTools.ts` (WebMCP tools)**:
- `design_bed`: validates bed in [1,2], mode in ['add','remove'], placements non-empty and max 24, crop_id exists, integer coordinates in bounds
- `log_task`: validates type in TIPOS_TAREA, crop_id exists if provided, note truncated to 200 characters, due_day >= 0 integer
- `diagnose_issue`: filters invalid symptoms from received array
- `list_crops`: uses `esEntero()` to validate sun_hours and min_space_cm ranges

### 4. No secrets in code

- No environment variables with secrets
- No hardcoded API keys
- No calls to external services
- Only storage is localStorage with non-sensitive garden data

### 5. Secure caching

```toml
# Hashed assets (Vite generates hashed filenames)
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31530000, immutable"

# HTML (always revalidate)
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

Vite's static assets have hashes in their names (e.g., `index-abc123.js`), so they can be cached indefinitely. HTML is always revalidated to receive updates after a deploy.

## Reduced attack surface

| Common vector | Status in PatchWork |
|--------------|-------------------|
| SQL Injection | Not applicable (no database) |
| XSS via API | Not applicable (no server API) |
| CSRF | Not applicable (no server sessions) |
| Session hijacking | Not applicable (no authentication) |
| Dependency injection | Mitigated by strict CSP |
| Clickjacking | Mitigated by X-Frame-Options + frame-ancestors |

## Considerations

- localStorage data is not sensitive (only garden configuration)
- WebMCP operates within the browser sandbox — the agent has no access to other sites
- CSP would block any attempt to load external scripts or fetch unauthorized domains

## References

- [HTTP Headers](./headers.md)
- [Validations](./validations.md)
- [Deployment](../deployment/platform.md)
- Source file: `netlify.toml`
