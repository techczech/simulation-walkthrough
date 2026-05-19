# Simulation Walkthrough Authoring

Use this to turn source material into phases, steps, glossary, diagrams, and LLM prompt content.

## Contents
- Core Principles
- Usage
- Prerequisites
- Workflow
  - Step 1: Analyze source material
  - Step 2: Define phase structure
  - Step 2b: Pedagogic design
  - Step 3: Generate step data
  - Step 4: Generate glossary
  - Step 5: Generate diagram component stubs
  - Step 6: Generate landing page content
  - Step 7: Generate llms.txt script

Generate interactive step-based walkthrough apps that explain source code, algorithms, or concepts through synchronized code, diagram, and narrative panels.

> **Template repo:** `~/gitrepos/10_webapps/how-llms-work/`
> Study this repo's structure before generating. All patterns below are extracted from it.
>
> **Learning log:** `~/gitrepos/_LEARNINGLOG/workflows/simulation-walkthrough-pattern/`
> Full documentation of the patterns and data model.
>
> **IMPORTANT:** All generated content goes in the TARGET project folder, not here.

## Core Principles

1. **Step data is the single source of truth** — all UI derives from a `steps.ts` array. No separate content stores, no derived state. Adding a step = adding one object.
2. **Human provides irreducible insight; agent generates delivery** — ask the user what makes this worth walking through. Their answer is the editorial compression that agents cannot originate. Everything else (narratives, annotations, glossary, diagrams) is agent work.
3. **One concept per step** — working memory holds ~4-7 items. Each step teaches exactly one idea. If a narrative covers two concepts, split it.
4. **Three legs of competence per step** — each step should develop at least one of: mental model (narrative), perception (diagram), fluency (code annotations / try-it-yourself). See `references/pedagogic-principles.md`.
5. **Glossary cross-references steps and terms** — every glossary entry links to relevant steps; every step's narrative links to glossary terms. This creates a navigable web.
6. **llms.txt is generated at build time, never hand-maintained** — import from data modules, template-literal output. Content stays in sync automatically.

## Usage

```
/SimulationWalkthrough <source-file-or-url> [--topic "Topic Name"] [--phases N]
```

## Prerequisites

- Source material: a code file, documentation, or conceptual outline to walk through
- Bun installed (runtime and package manager)
- Cloudflare account for deployment (optional)

## Workflow

### Step 1: Analyze source material

Read the source file or documentation. Identify:

- **Natural phases/sections** (aim for 4-8 phases) using these heuristics:
  - **For code**: Group by function/class boundaries, imports, data flow stages
  - **For concepts**: Group by prerequisite chains — what must be understood first? Use the 4-pass method: (1) major topics, (2) distinct ideas within topics, (3) map dependencies, (4) verify no cycles
  - **For documentation**: Group by user journey stages
  - **For processes**: Group by phase transitions and decision points
- **Key concepts** that need glossary entries (any term a beginner wouldn't know)
- **Walkthrough type**:
  - **Code-based** (default): Source code excerpts in CodePanel
  - **Concept-based**: No CodePanel — wider DiagramPanel + NarrativePanel (two-column layout)
  - **Documentation-based**: Markdown/text excerpts instead of syntax-highlighted code
  - **Process-based**: Workflow steps instead of code lines
- **The irreducible insight** — ask the user: "What makes this worth walking through? What's the core idea that can't be simplified further?"

### Step 2: Define phase structure

Create `stepGroups` array (4-8 groups). For each phase, determine:

- Color palette (use explicit Tailwind classes — no dynamic `bg-${color}-500`)
- Diagram type (flowchart, data visualization, architecture diagram, comparison table)
- Phase ID string (used as key in the diagram registry)

### Step 2b: Pedagogic design

Before generating content, read `references/pedagogic-principles.md` and apply these rules:

- **Prerequisite sequencing** — order steps so no step references concepts not yet introduced
- **Progressive disclosure** — core idea in narrative, details in expandable, edge cases in glossary
- **Concrete before abstract** — every narrative starts with a concrete example, then generalizes
- **Bridge between steps** — every narrative connects to the previous step ("Now that we have tokens...")
- **Explanatory annotations** — explain WHY each line exists, not just WHAT it does
- **Leaky abstractions** — use expandable sections for "what production systems do differently"
- **Task alignment** — match diagram type to what the step teaches (see `references/diagram-patterns.md`)

### Step 3: Generate step data

Create `src/data/steps.ts` following the Step interface from the template:

```typescript
interface CodeAnnotation {
  lines: number[]  // 1-indexed within the code excerpt
  title: string
  explanation: string
}

interface Step {
  id: string
  phase: string           // Maps to diagram component + color
  group: string           // Top-level category
  title: string
  subtitle: string
  narrative: string       // 150-300 words, accessible prose
  expandable?: { title: string; content: string }
  duration: number        // Auto-play duration in ms (8000-15000)
  codeStartLine?: number  // Offset in original source file
  code: string
  codeAnnotations?: CodeAnnotation[]
}
```

**Guidelines:**
- Target 10-15 steps; each teaches exactly one concept
- Each narrative: 150-300 words, structured as: what this step does → why it matters → how it connects to the whole
- Start with a concrete example, then generalize
- Bridge from previous step: "Now that we have X, we need Y..."
- Code annotations: 2-5 per step, each explaining WHY the line exists (not just what it does)
- Expandable sections: "try it yourself", "what production systems do differently", deeper technical detail
- `codeStartLine` should map to the actual line number in the source file
- Titles should be verb forms (Tokenize, Embed, Attend) — short and scannable
- Each step should develop at least one competence leg: mental model, perception, or fluency

### Step 4: Generate glossary

Create `src/data/glossary.ts` following the GlossaryEntry interface:

```typescript
interface GlossaryEntry {
  id: string
  term: string
  definition: string
  category: string          // e.g., 'text-to-numbers'
  relatedSteps: string[]    // Step IDs where this term is relevant
  seeAlso?: string[]        // Cross-references to other glossary terms
}
```

**Guidelines:**
- Target 30-50 terms
- Group into 4-8 categories that align with phases (e.g., "text-to-numbers" ↔ tokenizer phase)
- Each definition: 2-4 sentences. Jargon-free first sentence, technical detail after.
- Include every term used in narratives that a beginner wouldn't know
- Flag terms with domain-specific meanings (e.g., "attention" in ML vs general use)
- Every term must have at least one `relatedSteps` entry
- Use `seeAlso` to link related concepts (e.g., "gradient" ↔ "backpropagation")
- Sort terms longest-first when building the linkification regex (prevents "attention" matching before "attention head")

### Step 5: Generate diagram component stubs

Create one diagram function per phase in `src/components/DiagramPanel.tsx`:

```typescript
const diagrams: Record<string, () => ReactNode> = {
  overview: OverviewDiagram,
  phase1: Phase1Diagram,
  phase2: Phase2Diagram,
  // ...
}
```

**Guidelines** (see `references/diagram-patterns.md` for full catalog):
- Each diagram must answer: "What would the learner misunderstand without this visual?"
- Choose diagram type based on what the step teaches:
  - Data flow → flow chart or transformation diagram
  - Scale/comparison → comparison table or bar chart
  - Mechanism/sequence → animation sequence
  - Architecture → layer stack
  - Relationships → node graph
- Use Tailwind for styling, Framer Motion for animation
- Stagger animations: `delay: i * 0.06` for list items
- Animations play once on step entry (not continuously)
- Color encodes meaning (phase → palette), not decoration
- SVG for node graphs/custom shapes; HTML + Tailwind for everything else
- Fallback: `const Diagram = diagrams[phase] ?? OverviewDiagram`

### Step 6: Generate landing page content

- Title and subtitle for the walkthrough
- 2-3 sentence description
- Feature cards (one per phase or highlight)
- "Start walkthrough" CTA button
- Links to source material
- Navigation cards: About, Pedagogy (if applicable), Glossary

### Step 7: Generate llms.txt script

Create `scripts/generate-llms-txt.ts` following the template pattern:

```typescript
import { steps, stepGroups, scaleComparison } from '../src/data/steps'
import { glossaryEntries, glossaryCategories } from '../src/data/glossary'

// Generate llms.txt (summary) and llms-full.txt (complete dump)
// Write to public/ directory
```

Wire into build:
```json
"generate:llms": "bun scripts/generate-llms-txt.ts",
"build": "bun run generate:llms && tsc -b && vite build"
```
