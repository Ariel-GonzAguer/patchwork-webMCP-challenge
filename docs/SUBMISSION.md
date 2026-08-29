# PatchWork — Devpost Submission Texts (English)

Copy-paste ready. Fill the Devpost form with these.

---

## Tagline

A shared urban garden where you and your AI agent plan, plant, and care together — powered by WebMCP.

## Text description

### Why your use case is a strong fit for WebMCP

Gardening is a domain full of rules that are precise but painful to apply by hand: companion planting, spacing, sun requirements, seasonal windows. An agent that clicks through a visual grid "built for humans" is slow and error-prone. With WebMCP, PatchWork exposes the garden as six structured tools — `design_bed`, `suggest_plan`, `diagnose_issue`, `list_crops`, `get_garden_state`, `log_task` — each with a JSON schema and a deterministic rules engine behind it. The agent stops guessing pixel positions and starts negotiating against real horticultural constraints.

### How it creates a better user experience

Both actors share one source of truth: the same Zustand store, the same canvas, the same calendar. When the agent places a tomato via `design_bed`, you see it appear in the bed instantly, and every action lands in a visible activity log (actor, tool, warnings). The engine returns structured warnings — sun mismatch, spacing, antagonist pairs — so the agent can adjust and retry instead of silently breaking your plan. No account, no backend: everything runs in the browser, persisted to localStorage.

### What people and agents can do together that was difficult or impossible before

1. **Negotiated garden design.** "Plant tomatoes, basil and carrots, spaced nicely" is now a conversation with feedback, not a sequence of blind clicks.
2. **Validated plans.** "Plan my spring garden, I only get 4 hours of sun" returns only crops that actually fit those conditions, with reasons.
3. **Shared diagnosis.** The agent and the human use the exact same rules engine — "yellow leaves + brown spots on tomato" yields Early Blight with care actions, whether you click chips in the UI or ask in ChatGPT.

### How you implemented WebMCP

We register six tools on `document.modelContext` via the imperative API (top-level page, feature-detected with `typeof document.modelContext?.registerTool === "function"`). Tools follow the draft W3C spec: JSON Schema inputs with enums, `annotations.readOnlyHint: true` on read-only tools, strict validation in code (grid bounds, unknown crop ids, occupied cells) with descriptive errors so the agent can self-correct. Every tool reads/mutates the same Zustand store the React UI renders from, so agent actions are visible in real time and logged with actor and warning count. The rules engine (`MotorReglas`) is pure TypeScript — no LLM calls, no backend — making the whole system deterministic, testable (89 vitest tests), and free to run.

---

## Build & test

```bash
cd patchwork
npm install
npm run dev      # local
npm test         # 89 tests
npm run build    # production build
```

Live URL (Netlify): *(fill after deploy)*

Repository: *(fill with GitHub URL)*

## Testing in ChatGPT

1. Open the live URL in the ChatGPT desktop app's in-app browser (GPT-5.6 Sol or Terra).
2. The site registers 6 tools automatically — check "Available site tools" in the address bar.
3. Try: *"Plant tomatoes, basil and carrots in bed 1, spaced out nicely."*

Or in Chrome 149+: enable `chrome://flags/#enable-webmcp-testing`, then run in DevTools:
`await document.modelContext.getTools()`
