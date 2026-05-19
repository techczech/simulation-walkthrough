# Simulation Walkthrough Build and Deploy

Use this when scaffolding, building, verifying, deploying, or adapting non-code walkthroughs.

## Contents
  - Step 8: Scaffold project (if new)
  - Step 9: Build and verify
  - Step 10: Deploy
- Customization Points
- Non-Code Walkthroughs
- References
  - Local references (in this skill's references/ directory)
  - External references

### Step 8: Scaffold project (if new)

If no existing project:

```bash
bun create vite <name> --template react-ts
cd <name>
bun add framer-motion lucide-react
bun add -d tailwindcss @tailwindcss/vite
```

Copy the component structure from the template repo. Key files to adapt:
- `src/App.tsx` — routing (pushState, no router library)
- `src/components/Visualizer.tsx` — walkthrough engine
- `src/components/CodePanel.tsx` — code display with annotations
- `src/components/DiagramPanel.tsx` — phase-indexed diagram router
- `src/components/NarrativePanel.tsx` — prose with glossary links
- `src/components/GlossaryPopup.tsx` — term viewer
- `src/components/CopyToChatbot.tsx` — "Ask LLM" prompt generation
- `src/context/Theme.tsx` — light/dark mode

### Step 9: Build and verify

```bash
bun run build
```

Check:
- TypeScript compiles without errors
- `llms.txt` and `llms-full.txt` generated in `dist/` with all content
- All phases have diagram components (no unintentional OverviewDiagram fallback)
- All glossary terms appear in at least one narrative
- Prerequisite order: no step references concepts from later steps
- Keyboard navigation works through all steps (←, →, Space, Escape)
- Auto-play completes full cycle without errors
- Glossary links open popups with correct definitions
- "Ask LLM" generates valid prompts with correct URLs
- Mobile responsive (collapsible panels adapt to screen size)
- Light/dark mode renders correctly
- Each step develops at least one competence leg (mental model, perception, or fluency)

### Step 10: Deploy

Cloudflare Pages:

```bash
npx wrangler pages deploy dist --project-name=<project-name>
```

Required files:
- `public/_redirects`: `/* /index.html 200` (SPA routing)
- `public/_headers`: `Content-Type: text/plain; charset=utf-8` for `/llms.txt` and `/llms-full.txt`

## Customization Points

When creating a new walkthrough from the template:

- **Must customize**: step data, glossary, diagrams, landing page content, color palette, site URL.
- **Keep as-is**: Visualizer engine, CodePanel, NarrativePanel, GlossaryPopup, CopyToChatbot, Theme context.
- **Optional**: pedagogy page, About page, non-code layout.

## Non-Code Walkthroughs

The default layout is three-panel (Code / Diagram / Narrative) for code walkthroughs. For other content types:

- **Concept-only**: Remove CodePanel, expand to two-column: DiagramPanel (`w-[50%]`) + NarrativePanel (`w-[50%]`)
- **Documentation**: Replace syntax highlighting in CodePanel with formatted text/markdown rendering
- **Process**: Use workflow steps in the `code` field; annotations describe each process step rather than code lines

For non-code walkthroughs, the `code` field becomes a "source excerpt" field. The `codeStartLine` field can be omitted.

## References

### Local references (in this skill's `references/` directory)

- `references/step-interface.ts`: TypeScript interfaces; copy into the target project.
- `references/pedagogic-principles.md`: 10 principles for effective walkthrough design.
- `references/diagram-patterns.md`: 8 diagram types with implementation patterns and Framer Motion cookbook.
- `references/component-patterns.md`: reusable component architectures for Visualizer, panels, routing, and theme.
- `references/deployment.md`: Cloudflare Pages setup, Vite config, project scaffolding.
- `references/llms-txt-generator.md`: template for build-time llms.txt generation.

### External references

- Template repo: `~/gitrepos/10_webapps/how-llms-work/`.
- Sibling skill, pedagogy: `~/gitrepos/02_workskills/learn-weaver-skill/`.
- Pattern documentation: `~/gitrepos/_LEARNINGLOG/workflows/simulation-walkthrough-pattern/`.
- Pedagogy philosophy: `~/gitrepos/_LEARNINGLOG/education/explaining-to-agents/`.
