# PatchWork — Quickstart

PatchWork is a shared urban gardening app where humans and AI agents plan, plant, and care together, built with React 19, strict TypeScript, Michi-router and Zustand. Developed for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com).

**Production URL**: https://patchwork-webmcp-challenge.netlify.app/

## Quick start

```bash
# 1. Clone and install
git clone <repo-url>
cd patchwork
pnpm install

# 2. Start dev server
pnpm run dev

# 3. Verify (in another terminal)
pnpm test        # 83 tests
pnpm run build   # typecheck + build
```

## Stack

- **React 19** + **TypeScript** (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Vite 8** — bundler and dev server
- **Zustand 5** — global state persisted to localStorage
- **michi-router** — lightweight SPA routing
- **Vitest + Testing Library** — 83 tests
- **Netlify** — static deployment

## Documentation map

### Architecture

| Document | Contents |
|----------|----------|
| [Overview](./architecture/overview.md) | Stack, layers, directories, architectural decisions |
| [Routing](./architecture/routing.md) | Routes, navigation, SPA redirect |
| [Data flow](./architecture/data-flow.md) | 6 data flows with ASCII diagrams |

### Components

| Document | Contents |
|----------|----------|
| [Overview](./components/overview.md) | Inventory of 11 components, dependency graph, store consumption |
| [Patterns](./components/patterns.md) | Conventions, layout shell, accessibility, themes, responsive |

### Standout features

| Document | Contents |
|----------|----------|
| [WebMCP Tools](./features/webmcp-tools.md) | The 6 WebMCP tools: schemas, validations, examples |
| [Rules Engine](./features/rules-engine.md) | MotorReglas: filter, validate, suggest, diagnose |
| [Diagnosis](./features/diagnosis.md) | Diagnosis system: 12 symptoms, 14 problems, confidence algorithm |

### Security

| Document | Contents |
|----------|----------|
| [Implementation](./security/implementation.md) | Security model, CSP, no secrets |
| [Headers](./security/headers.md) | Detail of each HTTP header |
| [Validations](./security/validations.md) | Input validation in engine and WebMCP |

### Deployment

| Document | Contents |
|----------|----------|
| [Platform](./deployment/platform.md) | Netlify configuration, deploy flow, caching |
| [Troubleshooting](./deployment/troubleshooting.md) | 8 common errors with solutions |

### Development

| Document | Contents |
|----------|----------|
| [Testing](./development/testing.md) | 83 tests across 7 files, stack, commands |
| [Linting](./development/linting.md) | ESLint + Prettier, configuration |
| [Workflow](./development/workflow.md) | Setup, commands, conventions |

### Other

| Document | Contents |
|----------|----------|
| [Utils](./utils/overview.md) | Dependencies, helper functions |
| [Docs](./docs/overview.md) | Existing documentation, conventions |

## Standout features

- **[WebMCP Tools](./features/webmcp-tools.md)**: 6 tools that let an AI agent interact with the garden via the W3C WebMCP standard. The agent and human share the same store in real time.

- **[Rules Engine](./features/rules-engine.md)**: Pure TypeScript class that validates companion planting, spacing, sun requirements, and seasons. Scoring algorithm for planting suggestions.

- **[Diagnosis System](./features/diagnosis.md)**: Diagnosis engine that identifies 14 plant problems from 12 symptoms, with confidence scores and recommended actions.

## The 6 WebMCP tools

| Tool | Type | Purpose |
|------|------|---------|
| `list_crops` | read | Search crops by filters |
| `get_garden_state` | read | Current garden state |
| `design_bed` | write | Add/remove crops with validation |
| `suggest_plan` | read | Seasonal planting plan |
| `log_task` | write | Add care tasks |
| `diagnose_issue` | read | Diagnose problems by symptoms |
