# Linting and Code Quality

PatchWork uses ESLint with typescript-eslint for linting and Prettier for formatting. Both tools are configured to maintain consistent, strictly-typed code.

## ESLint

**File**: `eslint.config.js` (flat config format)

### Base configuration

| Config | Source | Purpose |
|--------|--------|---------|
| `js.configs.recommended` | `@eslint/js` | Recommended JavaScript rules |
| `tseslint.configs.recommendedTypeChecked` | `typescript-eslint` | Recommended rules with type-checking |
| `tseslint.configs.stylisticTypeChecked` | `typescript-eslint` | Style rules with type-checking |

### Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| `eslint-plugin-react-hooks` | 7.1.1 | React hooks rules (exhaustive-deps, rules-of-hooks) |
| `eslint-plugin-react-refresh` | 0.5.5 | Verifies components are hot-reload safe |

### Custom rules

```js
// For src/**/*.{ts,tsx} files
{
  ...reactHooks.configs.recommended.rules,
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
}
```

### Globals

| Scope | Globals |
|-------|---------|
| `src/**/*.{ts,tsx}` | `browser`, `es2022` |
| `src/tests/**/*.{ts,tsx}` | `browser`, `node` |

### Ignored files

- `dist/**`
- `node_modules/**`
- `coverage/**`
- `.netlify/**`
- `scripts/**`
- `docs/**`
- `*.config.js`
- `*.config.ts`

### Type-checking

ESLint uses `parserOptions.projectService` to access TypeScript type information. This enables rules like:
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-floating-promises`

## Prettier

**Version**: 3.9.6

Prettier is used for consistent formatting. It has no explicit configuration file — it uses defaults.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run lint` | Runs ESLint on the entire project |
| `pnpm run lint:fix` | Runs ESLint with auto-fix |
| `pnpm run format:check` | Verifies files are formatted with Prettier |
| `pnpm run format:fix` | Formats all files with Prettier |

## Deploy integration

The `deploy:netlify` script runs lint and format as part of the pipeline:

```json
"deploy:netlify": "pnpm audit && pnpm lint && pnpm format:fix && pnpm test && bash scripts/deploy-netlify.sh"
```

Order: audit → lint → format → test → deploy.

## References

- [Testing](./testing.md)
- [Development workflow](./workflow.md)
- Source file: `eslint.config.js`
