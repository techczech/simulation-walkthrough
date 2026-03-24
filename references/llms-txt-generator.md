# llms.txt Generator Template

Build-time script that generates LLM-readable text files from walkthrough data modules.

## Purpose

Following Karpathy's "markdown for agents" philosophy, every walkthrough publishes two text files:

- **`llms.txt`** (~3KB): Summary with table of contents, step list, glossary categories
- **`llms-full.txt`** (~30-70KB): Complete dump — all narratives, code with line numbers, annotations, glossary definitions

These files are generated from the same TypeScript data modules the app uses, ensuring content stays in sync.

## Script Template

```typescript
/**
 * Generates llms.txt and llms-full.txt from the app's data modules.
 * Run with: bun scripts/generate-llms-txt.ts
 */
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { steps, stepGroups } from '../src/data/steps'
import { glossary, glossaryCategories } from '../src/data/glossary'

const SITE_URL = 'https://your-site.pages.dev'  // CUSTOMIZE
const outDir = resolve(import.meta.dir, '../public')

// ── llms.txt (summary) ──

const summary = `# Your Walkthrough Title

> Brief description of the walkthrough.
> ${SITE_URL}

## Walkthrough Steps

${stepGroups.map(g => {
  const groupSteps = steps.filter(s => s.group === g.id)
  return `### ${g.label}\n${groupSteps.map(s => {
    const idx = steps.indexOf(s) + 1
    return `${idx}. **${s.title}** — ${s.subtitle}`
  }).join('\n')}`
}).join('\n\n')}

## Glossary (${glossary.length} terms)

${glossaryCategories.map(c => {
  const terms = glossary.filter(t => t.category === c.id)
  return `- **${c.label}** (${terms.length} terms): ${terms.map(t => t.term).join(', ')}`
}).join('\n')}

## Full content

For the complete walkthrough with all narratives, code, annotations,
and glossary definitions, see: ${SITE_URL}/llms-full.txt
`

// ── llms-full.txt (complete dump) ──

const full = `# Your Walkthrough Title — Complete Content

> Full content for LLM consumption.
> Summary version: ${SITE_URL}/llms.txt

${steps.map((s, i) => {
  const num = i + 1
  const startLine = s.codeStartLine ?? 1
  const lines = s.code.split('\n')

  let section = `## Step ${num}: ${s.title}\n\n`
  section += `**${s.subtitle}**\n\n`
  section += `${s.narrative}\n\n`

  if (s.expandable) {
    section += `### ${s.expandable.title}\n\n${s.expandable.content}\n\n`
  }

  section += `### Code (lines ${startLine}–${startLine + lines.length - 1})\n\n`
  section += '\\`\\`\\`python\n'
  section += lines.map((line, j) => {
    const ln = String(startLine + j).padStart(3, ' ')
    return \`\${ln} | \${line}\`
  }).join('\n')
  section += '\n\\`\\`\\`\n\n'

  if (s.codeAnnotations?.length) {
    section += '### Annotations\n\n'
    section += s.codeAnnotations.map(a =>
      \`**\${a.title}** (lines \${a.lines.map(l => l + startLine - 1).join(', ')}): \${a.explanation}\`
    ).join('\n\n')
    section += '\n\n'
  }

  return section
}).join('---\n\n')}

## Glossary

${glossaryCategories.map(c => {
  const terms = glossary.filter(t => t.category === c.id)
  return \`### \${c.label}\n\n\${c.description}\n\n\` +
    terms.map(t => {
      let entry = \`#### \${t.term}\n\n\${t.definition}\n\n\`
      entry += \`- **Category**: \${c.label}\n\`
      entry += \`- **Related steps**: \${t.relatedSteps.join(', ')}\n\`
      if (t.seeAlso?.length) entry += \`- **See also**: \${t.seeAlso.join(', ')}\n\`
      return entry
    }).join('\n')
}).join('\n\n')}
`

writeFileSync(resolve(outDir, 'llms.txt'), summary)
writeFileSync(resolve(outDir, 'llms-full.txt'), full)
console.log(\`Generated llms.txt (\${(summary.length / 1024).toFixed(1)}KB) and llms-full.txt (\${(full.length / 1024).toFixed(1)}KB)\`)
```

## Wire Into Build

In `package.json`:
```json
{
  "scripts": {
    "generate:llms": "bun scripts/generate-llms-txt.ts",
    "build": "bun run generate:llms && tsc -b && vite build"
  }
}
```

## Key Design Decisions

1. **Import from data modules** — not a separate content source. Single source of truth.
2. **Line numbers in code blocks** — include `codeStartLine` offsets so LLMs can reference exact lines.
3. **Structured headings** — `## Step N: Title` and `#### Term` enable LLMs to search by section.
4. **Cross-references** — glossary entries include related steps and see-also terms.
5. **Two files** — summary for quick orientation, full for deep context. The summary links to the full version.
