# Plant Diagnosis System

PatchWork includes a diagnosis system that identifies plant problems (diseases, pests, deficiencies) from observed symptoms. Both the human (via the UI) and the AI agent (via the `diagnose_issue` tool) can use it.

## How it works

The diagnosis is implemented in `MotorReglas.diagnosticar()` and operates on the 14-problem knowledge base defined in `src/datos/problemas.ts`.

### Flow

```
User selects crop + symptoms
  │
  ▼
MotorReglas.diagnosticar(cropId, symptoms[])
  │
  ├─ For each Problema in PROBLEMAS:
  │   ├─ Counts how many user symptoms match problema.symptoms
  │   ├─ Calculates confidence:
  │   │   base = 0.35
  │   │   ratio = matches / total_problem_symptoms
  │   │   confidence = 0.35 + 0.5 * ratio
  │   │   if cropId matches problema.cropIds → +0.2
  │   │   capped at 0.95
  │   └─ Discards if 0 matches
  │
  ├─ Sorts by confidence descending
  ├─ Takes top 3
  │
  ▼
Returns ResultadoDiagnostico[]
```

## The 12 symptoms

| Symptom | Description |
|---------|-------------|
| `yellowing` | Yellowing of leaves |
| `brown_spots` | Brown spots |
| `black_spots` | Black spots |
| `wilting` | Wilting |
| `holes` | Holes in leaves |
| `chewed` | Chewed leaves |
| `white_powder` | White powder (fungus) |
| `sticky` | Sticky residue (pest) |
| `curling` | Curling leaves |
| `stunted` | Stunted growth |
| `rot` | Rot |
| `mottled` | Mottled leaves (virus) |

## The 14 problems

| Problem | Severity | Symptoms | Affected crops |
|---------|----------|----------|----------------|
| Early Blight | high | brown_spots, yellowing, wilting | tomato, potato, pepper |
| Late Blight | high | black_spots, wilting, rot | tomato, potato |
| Powdery Mildew | medium | white_powder, curling | zucchini, cucumber, mint, chard |
| Blossom End Rot | medium | rot, brown_spots | tomato, pepper, zucchini |
| Aphids | medium | sticky, curling, yellowing, stunted | any crop |
| Whitefly | medium | sticky, yellowing, wilting | tomato, cucumber, zucchini, cabbage |
| Cutworm | medium | chewed, wilting | tomato, pepper, lettuce, cabbage, bean |
| Slugs and Snails | medium | holes, chewed | lettuce, cabbage, strawberry, spinach, chard |
| Overwatering / Root Rot | high | yellowing, wilting, rot | any crop |
| Nitrogen Deficiency | low | yellowing, stunted | corn, tomato, lettuce, cabbage |
| Tomato Hornworm | medium | chewed, holes | tomato, pepper |
| Mosaic Virus | high | mottled, curling, stunted | tomato, pepper, cucumber, bean |
| Downy Mildew | medium | yellowing, brown_spots | lettuce, spinach, cucumber, basil, cabbage |
| Leaf Miner | low | holes, mottled, stunted | chard, spinach, lettuce, tomato |

## Diagnosis page interface

The `Diagnostico` page (`src/paginas/diagnostico/index.tsx`) offers:

1. **Crop selector**: dropdown with all 26 crops from the catalog
2. **Symptom chips**: 12 toggle buttons with `aria-pressed` for selecting symptoms
3. **Results**: up to 3 cards with:
   - Problem name
   - Severity badge (low/medium/high)
   - Confidence percentage
   - Matching symptoms
   - List of recommended actions
4. **"Ask your agent" panel**: prompt suggestions for use with the AI agent via WebMCP

## Diagnosis example

Selected symptoms: `brown_spots`, `yellowing`, `wilting`
Crop: `tomato`

Result:
```
1. Early Blight — 95% confidence (high severity)
   Matching symptoms: brown_spots, yellowing, wilting
   Actions: Remove affected leaves, Apply copper fungicide, Improve air circulation

2. Aphids — 52% confidence (medium severity)
   Matching symptoms: yellowing, wilting (partial)
   Actions: Spray with neem oil, Introduce ladybugs, Check undersides of leaves
```

The +0.2 crop bonus makes Early Blight (which affects tomato) outrank generic problems like Aphids.

## Usage via WebMCP

The AI agent can execute the diagnosis directly:

```ts
// Tool: diagnose_issue
await document.modelContext.getTools()
  .find(t => t.name === 'diagnose_issue')
  .execute({
    crop_id: 'tomato',
    symptoms: ['brown_spots', 'yellowing', 'wilting']
  });
```

The agent receives the same structured results and can present them in natural language to the user.

## Limitations

- The knowledge base has 14 problems — it doesn't cover all possible diseases
- The confidence algorithm is heuristic, not statistical
- No image analysis — it depends on the user correctly identifying symptoms
- Problems with `cropIds: null` (Aphids, Overwatering) may produce false positives for crops not typically affected

## References

- [Rules engine](./rules-engine.md)
- [WebMCP tools](./webmcp-tools.md)
- Source files: `src/clases/MotorReglas.ts`, `src/datos/problemas.ts`, `src/paginas/diagnostico/index.tsx`
- Tests: `src/tests/motor-reglas.test.ts` (7 diagnosis tests), `src/tests/diagnostico-ui.test.tsx` (7 UI tests)
