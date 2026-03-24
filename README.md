# Simulation Walkthrough Skill

A [Claude Code](https://claude.ai/claude-code) skill for generating interactive step-based walkthrough apps that explain source code, algorithms, or concepts through synchronized code, diagram, and narrative panels.

## What it does

Given source material (code, documentation, or conceptual content), this skill guides an AI agent to generate:

- **Step data** (`steps.ts`) — 10-15 steps with narratives, code excerpts, and annotations
- **Glossary** (`glossary.ts`) — 30-50 terms with categories and cross-references
- **Diagram stubs** — one visualization per phase, using Framer Motion animations
- **Landing page** — hero section, navigation cards, CTAs
- **llms.txt** — LLM-readable content generated at build time

The generated app uses **Vite + React + TypeScript + Tailwind CSS + Framer Motion** and deploys to **Cloudflare Pages**.

## Reference implementation

Built from the patterns in [how-llms-work](https://github.com/techczech/how-llms-work) — an interactive walkthrough of Karpathy's microgpt (a complete GPT in 200 lines of Python). Live at [howllmswork-4fw.pages.dev](https://howllmswork-4fw.pages.dev).

## Pedagogic foundation

The skill applies principles from cognitive science and learning design:

- **One concept per step** — working memory is the bottleneck
- **Three legs of competence** — each step develops mental models (narrative), perception (diagrams), or fluency (annotations)
- **Progressive disclosure** — core idea in narrative, details in expandable sections, edge cases in glossary
- **Prerequisite sequencing** — steps ordered by dependency chains
- **Explanatory feedback** — annotations explain WHY, not just WHAT

Adapted from the [LearnWeaver skill](https://github.com/techczech/learn-weaver-skill)'s pedagogic framework. See `references/pedagogic-principles.md` for the full list.

## Usage

In Claude Code:

```
/SimulationWalkthrough path/to/source.py --topic "How X Works"
```

Or describe what you want: "Create an interactive walkthrough of this algorithm."

## Structure

```
SKILL.md                              # Full skill specification
AGENTS.md                             # Development instructions
references/
├── step-interface.ts                 # TypeScript interfaces to copy
├── pedagogic-principles.md           # 10 learning design principles
├── diagram-patterns.md               # 8 diagram types + Framer Motion cookbook
├── component-patterns.md             # Reusable component architectures
├── deployment.md                     # Cloudflare Pages setup + project scaffold
└── llms-txt-generator.md             # Build-time content generation template
```

## Related

- [how-llms-work](https://github.com/techczech/how-llms-work) — Reference implementation (live walkthrough)
- [Learning log: walkthrough patterns](https://github.com/techczech/_LEARNINGLOG/tree/main/workflows/simulation-walkthrough-pattern) — Technical documentation
- [Learning log: explaining to agents](https://github.com/techczech/_LEARNINGLOG/tree/main/education/explaining-to-agents) — Karpathy's educational philosophy

## License

MIT
