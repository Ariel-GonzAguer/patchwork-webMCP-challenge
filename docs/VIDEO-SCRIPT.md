# PatchWork — Video Script (<3 min)

**Formato:** YouTube, público, con audio. <3 minutos.
**Grabar con:** OBS Studio o Xbox Game Bar (Win+G) grabando Chrome/ChatGPT desktop.
**Audio:** narrar este guion en inglés mientras se graba.

## Estructura (tiempos objetivo)

| Tramo | Tiempo | Contenido |
|---|---|---|
| Hook | 0:00–0:15 | El problema: los agentes "hacen click" a ciegas |
| Demo UI | 0:15–0:45 | PatchWork como humano: plantar, ver warnings, diagnóstico |
| Demo agente | 0:45–1:50 | ChatGPT in-app browser: los 3 prompts estrella |
| Por qué WebMCP | 1:50–2:30 | Estado compartido, tools validados, log de confianza |
| Cierre | 2:30–2:50 | Learn page, repo, llamado a probarlo |

## Guion narrado (inglés)

**Hook:**
"Most AI agents browse the web by clicking and typing — guessing their way through interfaces built for humans. That's slow, fragile, and hard to trust. WebMCP changes that: websites can now expose structured tools an agent can call directly. This is PatchWork — a shared urban garden where you and your agent plant together."

**Demo como humano:**
"Here's the garden. Two beds, a 4-by-6 grid each. I plant tomatoes and basil — the rules engine tells me they're good companions. But if I put potatoes next to tomatoes, it warns me they're poor companions. Same engine powers the diagnosis page: yellow leaves plus brown spots on a tomato gives Early Blight, with concrete actions."

**Demo con agente (ChatGPT in-app browser):**
"Now the interesting part. I open PatchWork inside ChatGPT's browser. It discovers six tools — here they are. Let me ask it to design a bed for me."
*[Typed prompt: "Plant tomatoes, basil and carrots in bed 1, spaced out nicely."]*
"Watch: the agent calls `design_bed`, the rules engine validates every placement, and the canvas updates live — I can see exactly what it did in the activity log. Now let's push it:"
*[Typed prompt: "Add potatoes next to my tomatoes."]*
"The agent gets back a structured warning — poor companions — and can explain that to me instead of silently breaking the garden."
*[Typed prompt: "My tomato leaves are yellow with brown spots. Diagnose it."]*
"It calls `diagnose_issue` and returns Early Blight with actions, using the same engine I use in the UI."

**Por qué WebMCP:**
"Why does WebMCP matter here? Because we share the same state — same store, same canvas. The agent doesn't simulate my garden; it works on the real one. Every action is validated and logged, so trust is visible. And planning becomes a negotiation: ask for a spring plan with four hours of sun, and it proposes crops that actually fit, with reasons."

**Cierre:**
"PatchWork is open source — the Learn page documents all six tools, and the repo is linked below. Open it in ChatGPT and grow something together. Thanks for watching!"

## Prompts exactos para el video (copiar y pegar)

1. `Plant tomatoes, basil and carrots in bed 1, spaced out nicely.`
2. `Add potatoes next to my tomatoes.`
3. `My tomato leaves are yellow with brown spots. Diagnose it.`
4. `Plan my spring garden — I only get 4 hours of sun.`

## Checklist de grabación

- [ ] Reset del huerto antes de grabar (botón o limpiar localStorage)
- [ ] ChatGPT desktop con GPT-5.6 Sol/Terra (site tools activos)
- [ ] Mostrar el panel "Available site tools" del browser de ChatGPT
- [ ] Mostrar el activity log actualizándose en vivo
- [ ] Audio claro, sin música con copyright
- [ ] Editar a <3 min; probar el resultado en YouTube público
