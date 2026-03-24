# Simulation Walkthrough Skill — Development Instructions

Instructions for AI agents working on the skill itself (not for using the skill to generate walkthroughs).

## What this repo is

A Claude Code skill that generates interactive simulation walkthrough apps. The skill file (`SKILL.md`) contains the full workflow; `references/` contains patterns and interfaces extracted from the reference implementation.

## Key files

- `SKILL.md` — The skill specification. This is what Claude Code reads when the skill is triggered.
- `references/` — Supporting documentation read by the agent during generation:
  - `step-interface.ts` — TypeScript interfaces (the data model)
  - `pedagogic-principles.md` — Learning design principles (adapted from LearnWeaver)
  - `diagram-patterns.md` — Visualization types and Framer Motion patterns
  - `component-patterns.md` — Reusable React component architectures
  - `deployment.md` — Project scaffolding and Cloudflare Pages setup
  - `llms-txt-generator.md` — Template for build-time content generation

## How to improve the skill

1. **Test with a new topic** — Use the skill to generate a walkthrough for something other than microgpt. Note where the skill's guidance is insufficient.
2. **Update references** — If the reference implementation (`~/gitrepos/10_webapps/how-llms-work/`) changes, sync the relevant patterns into `references/`.
3. **Add new diagram types** — Document new visualization patterns in `references/diagram-patterns.md`.
4. **Refine pedagogic guidance** — The principles in `references/pedagogic-principles.md` are adapted from the LearnWeaver skill (`~/gitrepos/02_workskills/learn-weaver-skill/references/pedagogic-principles.md`). Update when the source evolves.

## Sibling skills

- **LearnWeaver** (`~/gitrepos/02_workskills/learn-weaver-skill/`) — Generates learning websites from transcripts/notes. Shares pedagogic principles.
- **PPT2HandoutSkill** — Converts PPTX to handout websites. Different scope (presentations → static sites).
- **LectureNotesSkill** — Generates narrative notes from transcripts. Different scope (audio → text).

## Conventions

- All generated content goes in the TARGET project folder, never in this repo.
- Reference files document patterns; they are not runnable code.
- `step-interface.ts` is a TypeScript file for easy copying, but it's documentation, not a build artifact.
