/**
 * Core data model for simulation walkthroughs.
 * Copy these interfaces into your project's src/data/steps.ts.
 *
 * Reference implementation: ~/gitrepos/10_webapps/how-llms-work/src/data/steps.ts
 */

export interface CodeAnnotation {
  lines: number[]  // 1-indexed line numbers within the code excerpt
  title: string
  explanation: string
}

export interface Step {
  id: string              // Unique identifier, e.g., 'tokenizer', 'attention'
  phase: string           // Maps to diagram component + color palette
  group: string           // Top-level organizational category for step pills
  title: string           // Short verb-form title, e.g., 'Tokenize', 'Attend'
  subtitle: string        // One-line description, e.g., 'Text → integers'
  narrative: string       // Multi-paragraph prose (150-300 words)
  expandable?: {          // Optional deep-dive content
    title: string         // Button label, e.g., 'How do production tokenizers differ?'
    content: string       // Extended explanation
  }
  duration: number        // Auto-play duration in ms (8000-15000 typical)
  codeStartLine?: number  // Line offset in original source file
  code: string            // Code excerpt to display
  codeAnnotations?: CodeAnnotation[]  // Line-by-line explanations
}

export interface StepGroup {
  id: string    // Matches Step.group values
  label: string // Display name in step pills bar
}

export interface GlossaryEntry {
  id: string
  term: string
  definition: string
  category: string          // e.g., 'text-to-numbers', 'attention-mechanism'
  relatedSteps: string[]    // Step IDs where this term is most relevant
  seeAlso?: string[]        // Cross-references to other glossary term IDs
}

export interface GlossaryCategory {
  id: string
  label: string
  description: string
}
