# Documentation Quality: react.dev Level

## Overview

Improve documentation to match react.dev quality standards. The core gaps:
- No "why" before "what" — content jumps to API without motivating the problem
- No Recap sections, no Challenges, no mental model page
- Home page is a feature showcase, not a value pitch
- Installation comes after Quick Start in nav (wrong order)

Approach: iterate one task at a time, each focused and self-contained.

---

## Implementation Steps

### Task 1: Fix navigation order — Installation before Quick Start

**Files:**
- Modify: `documentation/src/content/docs/learn/installation.mdx`
- Modify: `documentation/src/content/docs/learn/quick-start/index.mdx`
- Modify: `documentation/astro.config.mjs` (or sidebar config)

- [ ] Find where sidebar order is defined
- [ ] Move Installation before Quick Start in the sidebar
- [ ] Update "Next Steps" in Installation to point to Quick Start
- [ ] Update intro in Quick Start to not reference installation (it's done already)

---

### Task 2: Add home page intro paragraph

**Files:**
- Modify: `documentation/src/content/docs/home/index.mdx`

The home page currently has no text before the first sandbox — reader lands with zero context.

- [] Add 2–3 sentence intro above the first `<Sandbox>`:
  - Who this is for (JS/TS developers building modular apps)
  - What problem it solves (dependency order, wiring features together)
  - One-line pitch

---

### Task 3: Reframe home page sections as problems, not features

**Files:**
- Modify: `documentation/src/content/docs/home/index.mdx`

Currently: `## Reuse code for any task` — this is a feature name.
react.dev: starts with the developer's pain, then shows the solution.

- [ ] Rewrite each H2 + description to lead with the problem:
  - "Reuse code for any task" → frame as "tired of duplicating setup logic?"
  - "Toggle features with ease" → frame as "if-statements scattered everywhere?"
  - "Build with confidence" → frame as "debugging missing deps in prod?"
  - "See how things connect" → frame as "lost in your own architecture?"
- [ ] Keep descriptions concise (1–2 sentences), problem-first

---

### Task 4: Rewrite Quick Start — lead each section with the problem

**Files:**
- Modify: `documentation/src/content/docs/learn/quick-start/index.mdx`

Each section currently starts with a definition. React.dev starts with the developer's situation.

- [ ] "How to create a Task": add 1–2 sentences before the definition — what happens without Tasks, what problem they solve
- [ ] "How to run a Task": explain why you can't call Tasks directly (what goes wrong if you could)
- [ ] "How to pass data to a Task": set up the scenario — "your Task needs a userId, but hardcoding it breaks reuse..."
- [ ] "How to pass static data": explain when you'd reach for `literal` vs a Tag
- [ ] "How to disable Task": open with a scenario where a dev would need this

---

### Task 5: Add Recap section to Quick Start

**Files:**
- Modify: `documentation/src/content/docs/learn/quick-start/index.mdx`

- [ ] Add `## Recap` before "Next Steps"
- [ ] Bullet list — one line per concept covered:
  - Task: unit of logic with name + fn
  - Stage: logical phase, tasks inside run in parallel
  - Context / Tag: how to pass data without coupling tasks
  - `literal`: wraps plain values
  - `enabled`: controls whether a Task runs
- [ ] Keep it scannable — no prose, just bullets

---

### Task 6: Write "Thinking in App-Compose" page

**Files:**
- Create: `documentation/src/content/docs/learn/thinking-in-app-compose.mdx` (or similar path)
- Modify: sidebar config to include the new page

This is the most impactful missing page. Not a tutorial, not a reference — a mental model guide. react.dev's "Thinking in React" is its most praised page.

Structure:
1. Start with a real scenario (e.g. "you're building an app with auth, analytics, and a feature flag")
2. Show how you'd naturally decompose it into Tasks
3. Show how Stages give you execution order without coupling
4. Show how Tags let features talk without knowing each other
5. End with: "this is the App-Compose way of thinking"

- [ ] Draft the scenario (concrete, relatable, not toy-level)
- [ ] Walk through decomposition step by step with code
- [ ] Each step: problem → concept → solution
- [ ] Add to sidebar after Quick Start and before TypeScript

---

### Task 7: Add Challenges to Quick Start

**Files:**
- Modify: `documentation/src/content/docs/learn/quick-start/index.mdx`

React.dev's "Challenges" section at page end is a signature feature. Reader tests themselves with a sandbox, reveal solution on click.

- [ ] Write 2–3 challenges for Quick Start:
  - Challenge 1: create a Task that fetches something and returns data
  - Challenge 2: wire two Tasks so one receives the other's output via context
  - Challenge 3: disable a Task based on a Tag value
- [ ] Each challenge: problem description + starter sandbox + solution sandbox (collapsed)
- [ ] Check if Starlight has a collapse/details component, or use HTML `<details>`

---

## Post-Completion

**Manual review:**
- Read each page top-to-bottom as a new user who has never seen App-Compose
- Check that every concept is motivated before it is defined
- Verify sandbox examples match the surrounding prose exactly
