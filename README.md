# PatchWork 🌱

A shared urban garden where you and your AI agent plan, plant, and care together — powered by [WebMCP](https://webmachinelearning.github.io/webmcp/).

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com) (Aug 25 – Sep 3, 2026).

You can try it live at [https://patchwork-webmcp-challenge.netlify.app/](https://patchwork-webmcp-challenge.netlify.app/).

Watch a demo video: [→ Here](https://www.youtube.com/watch?v=nlM9p7lj1Io)

## How to use

There are two ways to use PatchWork:

1. **ChatGPT desktop app** (GPT-5.6 Sol/Terra): open the live URL in the in-app browser. The tools register automatically; check "Available site tools" in the address bar. Try: *"Plant tomatoes, basil and carrots in bed 1, spaced out nicely."*
2. **Chrome 149+**: enable `chrome://flags/#enable-webmcp-testing`, install the oficial [WebMCP extension](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd), go to the PatchWork URL, open the extension, put a compatible API key, and start interacting with the model. 

## What it does

PatchWork is an agent-native gardening app. Both you and an AI agent (ChatGPT's in-app browser, or Chrome with the WebMCP flag) work on the **same live canvas and calendar**, has four sections/pages:

- **Garden** — two 4×6 beds. Click to plant, click again to remove. The rules engine validates companion planting, spacing, sun needs and seasons, and shows warnings as you plant.
- **Calendar** — care tasks (water, harvest, prune…) generated from what you plant, with checkboxes.
- **Diagnose** — pick a crop and symptoms; the engine matches them against a 14-problem knowledge base and returns candidates with confidence scores and actions.
- **Learn** — what the agent sees: the 6 WebMCP tools, their schemas, and prompt examples.

## The 6 WebMCP tools

| Tool | Type | Purpose |
|---|---|---|
| `list_crops` | read | Search the crop catalog (keyword, sun, season, spacing) |
| `get_garden_state` | read | Current beds, placements, pending tasks |
| `design_bed` | write | Add/remove crops with validation; returns structured warnings |
| `suggest_plan` | read | Seasonal plan with reasons per crop |
| `log_task` | write | Add care tasks to the shared calendar |
| `diagnose_issue` | read | Symptoms + crop → likely problems with actions |

Every agent action mutates the same Zustand store the UI renders from — so you see it happen — and is recorded in the visible **Activity log** with actor, tool and warning count.

## Why WebMCP?

Gardening rules (companions, spacing, sun, seasons) are deterministic — perfect for structured tools. An agent clicking a visual grid "built for humans" is slow and error-prone. With WebMCP the agent calls `design_bed` and gets back real conflicts it can negotiate: *"potatoes and tomatoes are poor companions"* — then it adjusts. Planning becomes a conversation, not a guessing game.

## Stack

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Zustand (persisted to localStorage) — no backend, no LLM API calls, deterministic rules engine
- [michi-router](https://www.npmjs.com/package/@arielgonzaguer/michi-router) for routing
- Vitest + Testing Library — 89 tests including direct execution of every WebMCP tool

## Run

```bash
cd patchwork
npm install
npm run dev
```

## Test

```bash
npm test        # 89 tests: engine, store, UI (a11y), WebMCP tools
npm run build   # typecheck + production build
```

## Structure

```
src/
  clases/        MotorReglas (rules engine, pure TS)
  componentes/   encabezado, marco, detalle-cultivo, registro-actividad…
  datos/         cultivos.ts (27 crops), problemas.ts (14 issues)
  estilos/       global.css (light/dark themes)
  hooks/         useWebmcp
  paginas/       jardin, calendario, diagnostico, aprender
  store/         jardin.ts (Zustand + persist)
  tests/         engine, store, UI, WebMCP tools
  tipos/         dominio.ts, jardin.ts, webmcp.d.ts
  webmcp/        registrarTools.ts (the 6 tools)
```

## License

MIT — see [LICENSE](./LICENSE).
