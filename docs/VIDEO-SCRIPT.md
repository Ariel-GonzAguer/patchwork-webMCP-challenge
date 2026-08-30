# PatchWork — Video Script (<3 min)

**Formato:** YouTube, público, con audio. <3 minutos.
**Idioma:** audio en **español** + subtítulos en **inglés** (requisito del concurso: traducción al inglés).
**Grabar con:** OBS Studio o Xbox Game Bar (Win+G) grabando la app desktop de ChatGPT con su in-app browser.
**Subtítulos:** cargar `docs/VIDEO-SUBTITLES.srt` en YouTube Studio (ajustar tiempos si hace falta).

## Estructura (tiempos objetivo)

| Tramo          | Tiempo    | Contenido                                                 |
| -------------- | --------- | --------------------------------------------------------- |
| Hook           | 0:00–0:15 | El problema: los agentes "hacen click" a ciegas           |
| Demo UI        | 0:15–0:45 | PatchWork como humano: plantar, ver warnings, diagnóstico |
| Demo agente    | 0:45–1:50 | ChatGPT in-app browser: los 3 prompts estrella         |
| Por qué WebMCP | 1:50–2:30 | Estado compartido, tools validados, log de confianza      |
| Cierre         | 2:30–2:50 | Learn page, repo, llamado a probarlo                      |

## Guion narrado (español)

**Hook:**
"La mayoría de los agentes de IA navegan la web haciendo click y escribiendo — adivinando su camino por interfaces hechas para humanos. Es lento, frágil y difícil de confiar. WebMCP cambia eso: los sitios web ahora pueden exponer herramientas estructuradas que un agente llama directamente. Esto es PatchWork — un huerto urbano compartido donde vos y tu agente plantan juntos."

**Demo como humano:**
"Este es el huerto. Dos camas, cada una con una grilla de 4 por 6. Planto tomates y albahaca — el motor de reglas me dice que son buenos compañeros. Pero si pongo papas junto a los tomates, me advierte que son malos compañeros. El mismo motor alimenta la página de diagnóstico: hojas amarillas más manchas marrones en un tomate da mildiu temprano, con acciones concretas."

**Demo con agente (ChatGPT in-app browser):**
"Ahora la parte interesante. Abro PatchWork dentro del navegador de ChatGPT. Detecta seis herramientas — acá están, en Site tools. Le pido que diseñe una cama para mí."
*[Prompt tipeado: "Plant tomatoes, basil and carrots in bed 1, spaced out nicely."]*
"Miren: el agente llama a `design_bed`, el motor de reglas valida cada colocación, y el canvas se actualiza en vivo — puedo ver exactamente qué hizo en el registro de actividad. Ahora vamos a presionarlo:"
*[Prompt tipeado: "Add potatoes next to my tomatoes."]*
"El agente recibe una advertencia estructurada — malos compañeros — y puede explicármelo en vez de romper el huerto en silencio."
*[Prompt tipeado: "My tomato leaves are yellow with brown spots. Diagnose it."]*
"Llama a `diagnose_issue` y devuelve mildiu temprano con acciones, usando el mismo motor que uso yo en la interfaz."

**Por qué WebMCP:**
"¿Por qué importa WebMCP acá? Porque compartimos el mismo estado — el mismo store, el mismo canvas. El agente no simula mi huerto; trabaja sobre el real. Cada acción se valida y se registra, así la confianza es visible. Y planificar se vuelve una negociación: pedile un plan de primavera con cuatro horas de sol y te propone cultivos que realmente encajan, con razones."

**Cierre:**
"PatchWork es open source — la página Learn documenta las seis herramientas y el repo está en la descripción. Abrilo en ChatGPT y cultivá algo juntos. ¡Gracias por mirar!"

## Prompts exactos para el video (se tipean en inglés, copiar y pegar)

1. `Plant tomatoes, basil and carrots in bed 1, spaced out nicely.`
2. `Add potatoes next to my tomatoes.`
3. `My tomato leaves are yellow with brown spots. Diagnose it.`
4. `Plan my spring garden — I only get 4 hours of sun.`

## Checklist de grabación

- [ ] Reset del huerto antes de grabar (limpiar localStorage o recargar sin datos previos)
- [ ] ChatGPT desktop app actualizada, con GPT-5.6 Sol o Terra seleccionado
- [ ] Abrir la URL de Netlify en el in-app browser de ChatGPT
- [ ] Mostrar "Site tools" → "Available site tools" con los 6 tools
- [ ] Mostrar el activity log actualizándose en vivo
- [ ] Audio claro en español, sin música con copyright
- [ ] Subir a YouTube y cargar `docs/VIDEO-SUBTITLES.srt` como subtítulos en inglés
- [ ] Editar a <3 min; probar el resultado en YouTube público
