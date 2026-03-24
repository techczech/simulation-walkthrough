# Component Patterns for Simulation Walkthroughs

Extracted from the reference implementation at `~/gitrepos/10_webapps/how-llms-work/`. These are the reusable component architectures — copy and adapt for new walkthroughs.

## Architecture Overview

```
App.tsx (router)
└── Visualizer.tsx (walkthrough engine)
    ├── CodePanel.tsx (left: code + annotations)
    ├── DiagramPanel.tsx (center: phase-keyed visuals)
    ├── NarrativePanel.tsx (right: prose + glossary links)
    └── GlossaryPopup.tsx (modal overlay)
```

## 1. Visualizer Engine

**File**: `src/components/Visualizer.tsx`

The main walkthrough controller. Manages step state, navigation, and panel layout.

**Key state**:
```typescript
const [currentStep, setCurrentStep] = useState(0)
const [mode, setMode] = useState<'auto' | 'step'>('step')
const [isPlaying, setIsPlaying] = useState(false)
const [showExpandable, setShowExpandable] = useState(false)
const [showNarrative, setShowNarrative] = useState(true)
const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null)
```

**Auto-play timer**:
```typescript
useEffect(() => {
  if (mode !== 'auto' || !isPlaying) return
  const timer = setTimeout(() => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1)
    else setIsPlaying(false)
  }, step.duration)
  return () => clearTimeout(timer)
}, [mode, isPlaying, currentStep, step.duration])
```

**Keyboard navigation** (disabled when glossary popup is open):
```typescript
useEffect(() => {
  if (glossaryTermId) return  // Don't interfere with popup
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext() }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev() }
    else if (e.key === 'r') handleReset()
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [glossaryTermId, handleNext, handlePrev, handleReset])
```

**Panel layout** (three-column flex with collapsible right panel):
```typescript
<div className="flex-1 flex overflow-hidden p-3 gap-3 min-h-0">
  <div className={showNarrative ? 'w-[38%]' : 'w-[55%]'}>  {/* Code */}
  <div className={showNarrative ? 'w-[30%]' : 'w-[43%]'}>  {/* Diagram */}
  <motion.div animate={{ width: showNarrative ? '30%' : 0 }}> {/* Narrative */}
</div>
```

**Phase-based gradient** for banner:
```typescript
const gradient = (() => {
  const p = step.phase
  if (p === 'tokenizer') return 'from-blue-700 to-blue-800'
  if (p === 'attention') return 'from-purple-600 to-purple-700'
  // ... one line per phase
  return 'from-gray-700 to-gray-800'  // fallback
})()
```

**Step pills** (grouped by stepGroups):
```typescript
{stepGroups.map(group => {
  const groupSteps = steps.filter(s => s.group === group.id)
  return groupSteps.map(({ step, index }) => (
    <button onClick={() => setCurrentStep(index)}
      className={cn(
        i === currentStep ? 'bg-gray-800 text-white'
          : i < currentStep ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
      )}>
      {step.title}
    </button>
  ))
})}
```

## 2. CodePanel

**File**: `src/components/CodePanel.tsx`

Displays syntax-highlighted code with interactive annotation overlays.

**Key features**:
- Line number offset: `const lineOffset = codeStartLine - 1` → display `lineNum + lineOffset`
- Annotation map: `Map<lineNumber, CodeAnnotation>` for O(1) lookup on click
- Click line to toggle annotation card (appears after last line of the annotation group)
- Header shows: `microgpt.py lines {start}–{end}`

**Syntax highlighting** (regex-based, no library):
```typescript
function SyntaxLine({ text }: { text: string }) {
  // Tokenize with regex: keywords, builtins, strings, numbers, comments
  const tokens = tokenize(text)
  return <>{tokens.map(t => <span className={colorClass(t.type)}>{t.text}</span>)}</>
}
```

**Annotation card** (inserted inline):
```typescript
{lineNum === insertAfterLine && activeAnnotation && (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mx-2 my-1">
      <h4>{activeAnnotation.title}</h4>
      <p>{activeAnnotation.explanation}</p>
    </div>
  </motion.div>
)}
```

## 3. DiagramPanel

**File**: `src/components/DiagramPanel.tsx`

Routes to the correct diagram component based on step phase.

**Pattern**:
```typescript
const diagrams: Record<string, () => ReactNode> = {
  overview: OverviewDiagram,
  tokenizer: TokenizerDiagram,
  // ...
}

export function DiagramPanel({ phase, title, subtitle }: DiagramPanelProps) {
  const Diagram = diagrams[phase] ?? OverviewDiagram
  return (
    <div className="h-full flex flex-col bg-white rounded-xl">
      <div className="px-4 py-2.5 border-b">
        <span className="text-lg font-bold">{title}</span>
        {subtitle && <span className="text-sm text-gray-500 ml-2">{subtitle}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-5"><Diagram /></div>
    </div>
  )
}
```

## 4. NarrativePanel

**File**: `src/components/NarrativePanel.tsx`

Renders narrative prose with inline glossary links.

**Glossary linkification algorithm**:
1. Import all glossary entries
2. Sort terms longest-first (prevents "attention" matching before "attention head")
3. Build regex: `/\b(term1|term2|...)\b/gi`
4. For each paragraph, replace first occurrence only with a clickable button
5. On click, call `onGlossary(termId)` to open the GlossaryPopup

**Text formatting rules**:
- Lines starting with `>` → italic, purple, left border (blockquote style)
- Lines starting with `- ` → bullet list
- Regular paragraphs → standard prose
- Expandable section → collapsible box below main narrative

## 5. GlossaryPopup

**File**: `src/components/GlossaryPopup.tsx`

Modal overlay for term definitions.

**Features**:
- Opens when `termId` is set, closes on Escape or click outside
- Shows: term, definition, category, related steps, see-also terms
- Navigation: ← → arrows to browse terms in category order
- Pin button for comparing multiple terms
- "Ask LLM" button for deeper exploration

## 6. CopyToChatbot

**File**: `src/components/CopyToChatbot.tsx`

Generates ready-made prompts for LLM chatbots.

**Two prompt types**:
- **Step prompt**: "I'm on Step N: {title}. Explain this step. Fetch {origin}/llms-full.txt for context."
- **Glossary prompt**: "Explain: {term} ({category}). Fetch {origin}/llms-full.txt for context."

**UI**: "Ask LLM" button → modal with prompt text + "Copy to clipboard" button.

## 7. SPA Routing (No Library)

**File**: `src/App.tsx`

```typescript
type View = 'landing' | 'visualizer' | 'glossary' | 'pedagogy' | 'about'

const navigate = (view: View, path: string) => {
  window.history.pushState({ view }, '', path)
  setCurrentView(view)
}

// On mount + popstate:
const viewFromPath = (path: string): View => {
  if (path === '/visualizer') return 'visualizer'
  if (path === '/glossary') return 'glossary'
  // ...
  return 'landing'
}
```

## 8. Theme Context

**File**: `src/context/Theme.tsx`

```typescript
type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>()

// Persists to localStorage as 'hlw-theme'
// Components use: const { theme } = useTheme(); const d = theme === 'dark'
```

## Non-Code Walkthroughs

For concept-only or documentation walkthroughs where there's no source code:

- **Remove CodePanel** from the layout
- **Expand DiagramPanel** to `w-[50%]` and NarrativePanel to `w-[50%]`
- The `code` field in Step becomes a "source excerpt" — could be markdown, config, or prose
- Alternatively, replace CodePanel with a second type of visual (e.g., a detail view)
