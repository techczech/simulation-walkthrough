# Diagram Patterns for Simulation Walkthroughs

Each step has a `phase` that maps to a diagram component via a registry. This guide covers which diagram type to use and how to implement it.

## The Registry Pattern

```typescript
// DiagramPanel.tsx
const diagrams: Record<string, () => ReactNode> = {
  overview: OverviewDiagram,
  tokenizer: TokenizerDiagram,
  attention: AttentionDiagram,
  // ...add one entry per phase
}

// Usage:
const Diagram = diagrams[step.phase] ?? OverviewDiagram
```

## Diagram Types

### 1. Flow Chart (Process Steps)

**When**: Show a sequence of operations (training loop, data pipeline, inference flow)

**Pattern**: Horizontal or vertical chain of labeled boxes connected by arrows.

```tsx
const stages = [
  { label: 'Tokenize', desc: 'Text → integers', color: 'bg-blue-100 text-blue-800' },
  { label: 'Embed', desc: 'IDs → vectors', color: 'bg-indigo-100 text-indigo-800' },
  // ...
]

{stages.map((s, i) => (
  <motion.div key={s.label}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08 }}
    className={`rounded-lg border p-3 ${s.color}`}
  >
    <div className="font-bold text-sm">{s.label}</div>
    <div className="text-xs opacity-70">{s.desc}</div>
  </motion.div>
))}
```

**Use for**: Overview/summary steps, pipeline explanations, workflow descriptions.

### 2. Data Transformation

**When**: Show input → processing → output for a specific operation.

**Pattern**: Two columns (before/after) or three columns (input → transform → output) with arrows between.

**Use for**: Tokenization (text → integers), embedding (IDs → vectors), softmax (logits → probabilities).

### 3. Layer Stack

**When**: Show nested or stacked components of an architecture.

**Pattern**: Vertical stack of labeled blocks with connecting lines.

```tsx
const layers = [
  { name: 'Output Projection', params: '16×65', color: 'bg-green-100' },
  { name: 'MLP', params: '64×256 + 256×64', color: 'bg-amber-100' },
  { name: 'Attention', params: '4 heads × Q,K,V', color: 'bg-purple-100' },
  { name: 'Embeddings', params: '65×16 + 32×16', color: 'bg-indigo-100' },
]
```

**Use for**: Model architecture, network layers, component hierarchy.

### 4. Comparison Table

**When**: Compare small-scale vs production-scale, or two approaches side-by-side.

**Pattern**: Two-column table with labeled rows.

```tsx
const rows = [
  { label: 'Parameters', small: '7,793', large: '1.76 trillion' },
  { label: 'Vocabulary', small: '65 chars', large: '100K+ tokens' },
  // ...
]
```

**Use for**: Scale comparison, before/after, trade-off analysis.

### 5. Bar/Line Chart

**When**: Show quantities, progress, or trends (training loss, parameter counts).

**Pattern**: Animated bars growing from zero.

```tsx
{data.map((d, i) => (
  <motion.div
    key={d.label}
    initial={{ scaleY: 0 }}
    animate={{ scaleY: 1 }}
    transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
    style={{ height: `${d.value / max * 100}%` }}
    className="bg-blue-500 rounded-t origin-bottom"
  />
))}
```

**Use for**: Training curves, loss values, parameter distributions across layers.

### 6. Animation Sequence

**When**: Show a step-by-step process that unfolds over time (attention mechanism, autoregressive generation).

**Pattern**: Elements appear sequentially with staggered delays.

```tsx
{tokens.map((tok, i) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 + i * 0.15 }}
  >
    {tok}
  </motion.div>
))}
```

**Use for**: Autoregressive generation (token by token), attention weight computation, gradient flow.

### 7. Node Graph

**When**: Show relationships, dependencies, or computation graphs.

**Pattern**: SVG nodes connected by edges (lines or curves).

**Use for**: Computation graphs (autograd), concept dependency maps, module relationships.

### 8. Vector/Matrix Visualization

**When**: Show the contents or shape of tensors.

**Pattern**: Grid of colored cells representing values.

```tsx
function VecRow({ values, color }: { values: number[], color: string }) {
  return (
    <div className="flex gap-0.5">
      {values.map((v, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm ${color}`}
          style={{ opacity: 0.3 + v * 0.7 }} />
      ))}
    </div>
  )
}
```

**Use for**: Embedding vectors, attention weights, parameter matrices.

## Design Rules

1. **Answer the question**: Every diagram must answer "What would the learner misunderstand without this visual?" If the narrative alone is sufficient, use a simpler diagram.

2. **User-controlled pacing**: Default to step mode. Animations should play on step entry, not continuously. Use `initial` + `animate` (plays once on mount), not infinite loops.

3. **Color encodes meaning**: Use the phase color palette consistently. Don't use color for decoration.

4. **Stagger for rhythm**: Use `delay: i * 0.06` (or similar) for list items. This creates visual hierarchy without being slow.

5. **SVG vs HTML**: Use SVG for node graphs and custom shapes. Use HTML + Tailwind for everything else (simpler, more accessible, easier to maintain).

6. **Keep it simple**: A diagram with 5 clear elements beats one with 20 crowded elements. If the concept is complex, animate elements appearing in sequence rather than showing everything at once.

## Framer Motion Cookbook

```tsx
// Fade in from below (default for most elements)
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}

// Scale from zero (bars, charts)
initial={{ scaleY: 0 }}
animate={{ scaleY: 1 }}
style={{ transformOrigin: 'bottom' }}

// Staggered list
transition={{ delay: index * 0.06 }}

// Spring physics (bouncy, natural)
transition={{ type: 'spring', stiffness: 200, damping: 20 }}

// Step transitions (wrap panels)
<AnimatePresence mode="wait">
  <motion.div key={step.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  />
</AnimatePresence>
```
