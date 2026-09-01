# Deploying to Netlify

PatchWork deploys as a static site on Netlify. There is no server — Vite generates a static bundle in `dist/` and Netlify serves it from its CDN.

## Configuration

**File**: `netlify.toml`

| Parameter | Value | Description |
|-----------|-------|-------------|
| Build command | `pnpm build` | Runs `tsc && tsc -p tsconfig.node.json && vite build` |
| Publish directory | `dist` | Vite output directory |
| Node version | `22` | Node version for the build |

## Deploy flow

```
Developer pushes to main
  │
  ▼
Netlify detects repo change
  │
  ▼
Build: pnpm build
  ├─ tsc (typecheck src/)
  ├─ tsc -p tsconfig.node.json (typecheck configs)
  └─ vite build (bundle to dist/)
  │
  ▼
Netlify publishes dist/ to its CDN
  │
  ├─ Applies security headers (netlify.toml)
  ├─ Applies SPA redirect (/* → /index.html)
  └─ Serves assets with immutable cache
```

## SPA redirect

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This lets `michi-router` handle all routes on the client. When a user reloads at `/calendario`, Netlify serves `index.html` and the router renders `<Calendario />`.

## Asset caching

Vite generates assets with hashes in their names (e.g., `assets/index-abc123.js`). Netlify serves them with `Cache-Control: public, max-age=31536000, immutable`, enabling indefinite caching. Each deploy generates new hashes, automatically invalidating the cache.

HTML (`index.html`) is served with `Cache-Control: public, max-age=0, must-revalidate` so it always checks for a new version.

## Environment variables

PatchWork does not use environment variables in production. There are no API keys or secrets. The only use of environment variables is in the local deploy script:

| Variable | Where | Purpose |
|----------|-------|---------|
| `NETLIFY_SITE_ID` | `.env.local` (local) | Netlify site ID for manual deploy |
| `NETLIFY` | Build script | Flag to indicate Netlify build context |

## Manual deploy script

`scripts/deploy-netlify.sh` enables manual deployment from the developer's machine:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Load NETLIFY_SITE_ID if present
[ -f .env.local ] && source .env.local

# Verify tools
command -v pnpm >/dev/null || { echo "pnpm not found"; exit 1; }
command -v netlify >/dev/null || { echo "netlify CLI not found"; exit 1; }

# Build
NETLIFY=1 pnpm run build

# Deploy
if [ -n "${NETLIFY_SITE_ID:-}" ]; then
  netlify deploy --prod --site "$NETLIFY_SITE_ID"
else
  netlify deploy --prod
fi
```

**Requirements**: `pnpm` and `netlify` CLI installed globally.

## Production URL

https://patchwork-webmcp-challenge.netlify.app/

## Deploy commands

| Command | Context | Description |
|---------|---------|-------------|
| `pnpm run deploy:netlify` | Local | Audit + lint + format + test + manual deploy |
| `bash scripts/deploy-netlify.sh` | Local | Build + deploy only (no checks) |
| Push to `main` | CI/CD | Netlify auto-deploy via git integration |

## References

- [Security headers](../security/headers.md)
- [Troubleshooting](./troubleshooting.md)
- [Linting and quality](../development/linting.md)
- Source file: `netlify.toml`, `scripts/deploy-netlify.sh`
