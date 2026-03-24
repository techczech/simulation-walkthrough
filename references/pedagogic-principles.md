# Pedagogic Principles for Simulation Walkthroughs

Adapted from the LearnWeaver skill's pedagogic framework, focused on interactive step-based walkthroughs.

## Core Framework: Three Legs of Competence

Every step in a walkthrough should develop at least one competence leg:

| Leg | What it develops | Walkthrough element |
|-----|-----------------|-------------------|
| **Mental Model** | Conceptual understanding, vocabulary, relationships | Narrative panel, glossary definitions |
| **Perception** | Ability to recognize patterns, see structure | Diagram panel, code highlighting |
| **Fluency** | Speed and automaticity | Code annotations, "try it yourself" expandables |

Most walkthroughs naturally build mental models (through narrative) and perception (through diagrams). Fluency is harder — use expandable sections with exercises, and "Ask LLM" prompts that encourage the learner to explain back.

## Principles Applied to Walkthroughs

### 1. One Concept Per Step

**Why**: Working memory holds ~4-7 items. Each step should teach exactly one idea.

**How**: If a step narrative covers two distinct concepts, split it into two steps. The step title should be a single verb or noun phrase (e.g., "Tokenize", "Attend", "Backprop").

**Test**: Can you summarize what this step teaches in one sentence? If not, split it.

### 2. Prerequisite Sequencing

**Why**: Understanding attention requires understanding embeddings, which requires understanding tokens.

**How**: Order steps so no step references concepts not yet introduced. Use the 4-pass method:
1. Identify major topics
2. Break into distinct ideas
3. Map dependencies (what must be known first)
4. Verify: no cycles, every concept reachable from step 1

**Test**: Read steps in order — does anything reference a concept that hasn't been introduced yet?

### 3. Progressive Disclosure

**Why**: Don't overwhelm with detail when the learner is still building the mental model.

**How**: Layer information across three levels:
- **Narrative** (always visible): Core concept, what it does, why it matters
- **Expandable** (on click): Deeper detail, "try it yourself", how production differs
- **Glossary** (on hover): Precise definitions, edge cases, related terms

### 4. Concrete Before Abstract

**Why**: The brain anchors abstractions to concrete examples.

**How**: Every narrative should start with a concrete example or visual before generalizing.
- Bad: "Attention computes a weighted sum over value vectors."
- Good: "When predicting the next letter after 'ka', the model needs to look back at previous letters. Attention is how each token checks what came before..."

### 5. Explanatory Annotations

**Why**: Code annotations should explain WHY, not just WHAT.

**How**: Each annotation should answer "why does this line exist?" or "what would go wrong without it?"
- Bad: "Line 3: Sets the learning rate to 0.001"
- Good: "Line 3: Learning rate controls step size. Too large → overshoots; too small → takes forever. 0.001 is a safe starting point for Adam."

### 6. Bridge Between Steps

**Why**: Each step should feel like a natural continuation, not a disconnected topic.

**How**: Start each narrative by connecting to the previous step:
- "Now that we have tokens (integers), we need to convert them into something the model can work with — vectors."
- "The model can now attend to previous tokens. But attention alone isn't enough — we need a way to transform the combined information."

### 7. Leaky Abstractions

**Why**: Every simplification breaks somewhere. Learners need scaffolding for when it breaks.

**How**: Use expandable sections for "what production systems do differently":
- "In microgpt, we use character-level tokenization. Production models like GPT-4 use BPE with 100K+ tokens — but the principle is the same."
- "Our attention has 4 heads. GPT-4 has 96. More heads = more ways to attend, but the mechanism is identical."

### 8. Task Alignment

**Why**: The diagram type should match what the step is trying to teach.

**How**: Match visualization to learning objective:
- Teaching data flow → flow chart or transformation diagram
- Teaching scale → comparison table or bar chart
- Teaching mechanism → animated sequence
- Teaching structure → layer stack or architecture diagram
- Teaching relationships → node graph

### 9. Proportional Engagement

**Why**: Not every learner wants the same depth.

**How**: The collapsible narrative panel supports two learning paths:
- **Quick path**: Diagram + code only (collapse narrative)
- **Deep path**: All three panels + expandable sections + glossary

### 10. Mayer's Multimedia Principles

**Why**: Visuals should support cognition, not duplicate text.

**How**:
- Diagrams show what's hard to describe in words (attention patterns, data flow)
- Narrative explains what diagrams can't show (motivation, context, trade-offs)
- Never put the same text in both diagram and narrative
- Animations clarify sequence and timing, not decoration

## Source

Adapted from the LearnWeaver skill (`~/gitrepos/02_workskills/learn-weaver-skill/references/pedagogic-principles.md`), which draws on cognitive load theory, Mayer's multimedia learning principles, and deliberate practice research.
