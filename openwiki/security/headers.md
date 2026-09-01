# Security HTTP Headers

All security headers are configured in `netlify.toml` and applied by Netlify CDN on every response.

## Full configuration

```toml
# Cache for hashed assets (Vite generates hashed filenames)
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Security headers + no-cache for HTML
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    Cache-Control = "public, max-age=0, must-revalidate"
```

## Header details

### X-Frame-Options

| Field | Value |
|-------|-------|
| Value | `SAMEORIGIN` |
| Purpose | Prevents the page from being embedded in iframes from other origins |
| Protects against | Clickjacking |

### X-Content-Type-Options

| Field | Value |
|-------|-------|
| Value | `nosniff` |
| Purpose | Forces the browser to respect the declared Content-Type |
| Protects against | MIME type sniffing (e.g., treating a .txt as .html) |

### Referrer-Policy

| Field | Value |
|-------|-------|
| Value | `strict-origin-when-cross-origin` |
| Purpose | Sends full URL as referrer only for same-origin requests |
| Protects against | Leakage of internal URLs to external sites |

### Strict-Transport-Security (HSTS)

| Field | Value |
|-------|-------|
| Value | `max-age=63072000; includeSubDomains; preload` |
| Purpose | Forces HTTPS for 2 years (63072000 seconds), including subdomains |
| Protects against | SSL stripping, downgrade attacks |
| Note | `preload` allows inclusion in browser HSTS preload lists |

### Permissions-Policy

| Field | Value |
|-------|-------|
| Value | `camera=(), microphone=(), geolocation=()` |
| Purpose | Disables access to camera, microphone, and geolocation |
| Protects against | Unauthorized access to device hardware |
| Note | PatchWork does not need these permissions |

### Content-Security-Policy

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy: same-origin only |
| `script-src` | `'self'` | Same-origin scripts only |
| `style-src` | `'self' 'unsafe-inline'` | Own styles + inline (React needs inline styles) |
| `img-src` | `'self' data:` | Own images + data URIs (favicon SVG) |
| `font-src` | `'self'` | Same-origin fonts only |
| `connect-src` | `'self'` | Same-origin fetch/XHR only (no external APIs) |
| `object-src` | `'none'` | No plugins (Flash, Java, PDF embeds) |
| `base-uri` | `'self'` | Prevents base URL changes |
| `form-action` | `'self'` | Forms can only post to same origin |
| `frame-ancestors` | `'none'` | Cannot be embedded in any iframe |

### Cache-Control (assets)

| Field | Value |
|-------|-------|
| Scope | `/assets/*` |
| Value | `public, max-age=31536000, immutable` |
| Purpose | Indefinite cache for hashed assets (Vite generates unique names per build) |

### Cache-Control (HTML)

| Field | Value |
|-------|-------|
| Scope | `/*` (everything, including index.html) |
| Value | `public, max-age=0, must-revalidate` |
| Purpose | Always revalidate with server to receive updated HTML after deploy |

## Precedence order

On Netlify, more specific headers take precedence. The `/assets/*` rule comes before `/*` so assets inherit immutable caching instead of the HTML's no-cache.

## References

- [Security implementation](./implementation.md)
- [Netlify deployment](../deployment/platform.md)
- Source file: `netlify.toml`
