---
title: Documentation Gaps — Writing Plan
description: What is missing or incomplete in the app-compose documentation.
---

This file tracks confirmed gaps in the documentation. Each item was verified against the actual source code in `packages/app-compose/src`.

---

## Public API surface (source of truth)

From `packages/app-compose/src/index.ts`:

```ts
export { compose, type ComposeLogger } from "@compose"
export { literal, map, optional, type SpotValue } from "@computable"
export { bind, createTag, createTask, type Task, type TaskStatus } from "@runnable"
```

---

## Gap 1 — `map` is exported but completely undocumented

**Priority: high**

`map` is a public export. It is not mentioned anywhere in the documentation.

What needs to be written:

- Signature: `map<S, T>(spot: Spot<S>, fn: (from: S) => T): Spot<T>`
- Purpose: transforms a Spot value before it reaches a task's context. Avoids creating an intermediate task just to reshape data.
- What happens when `fn` throws: the spot evaluates to `Missing$`, which causes dependent tasks to receive no value (or `undefined` if wrapped in `optional`).
- Code example: transforming a user object to extract a single field.

Suggested location: new section in `learn/quick-start` or a dedicated guide page.

---

## Gap 2 — `optional` is exported but undocumented

**Priority: high**

`optional` appears on the homepage graph example without any introduction and is listed as a TODO in `guides/example.mdx`.

What needs to be written:

- Signature: `optional<T>(spot: Spot<T>): Spot<T | undefined>`
- Purpose: marks a dependency as non-blocking. If the upstream task was skipped or failed, the dependent task still runs and receives `undefined` for that value instead of being skipped itself.
- Contrast with required dependencies: without `optional`, a missing upstream causes all downstream tasks to be skipped.
- Code example: a task that renders UI whether or not an optional feature task succeeded.

Suggested location: new guide `guides/optional-dependencies` or a section in `guides/coupling-practices`.

---

## Gap 3 — Execution model: parallel tasks within a stage

**Priority: high**

The quick-start says stages "execute sequentially" in a single sentence. It says nothing about what happens inside a stage.

Actual behavior (from `packages/app-compose/src/compose/runner.ts:15–35`):

- Stages run sequentially via a `for` loop with `await`.
- Tasks inside one stage run **in parallel** via `Promise.all`.

What needs to be written:

- Stages = sequencing unit. Tasks in the same stage run in parallel.
- Rule of thumb: independent tasks → same stage. Task B needs task A's output → separate stages.
- Common mistake: putting dependent tasks in the same stage and getting `undefined` context because A has not finished when B starts.

Suggested location: expand "How to run a Task" in `learn/quick-start` or add a dedicated section.

---

## Gap 4 — `compose()` methods: `graph()` and `guard()` are undocumented

**Priority: medium**

`graph()` has its own guide (`guides/inspecting-app-topology`). `guard()` has no documentation at all.

`guard()` throws if:
- Two tasks or bindings share the same `name`.
- A task has an unsatisfied required dependency (no binding or upstream task provides it).
- A binding exists that no task depends on.

What needs to be written:

- When to call `guard()`: during development or CI, before calling `run()`, to catch wiring mistakes early.
- What errors it produces and what they mean.

Suggested location: a section in `learn/quick-start` or a new short guide.

---

## Gap 5 — `Task` type: `.result`, `.status`, `.error` properties

**Priority: medium**

The `Task<R>` return value exposes three properties that can be used as Spot dependencies in other tasks:

- `task.result` — the return value of `run.fn`, typed as `Spot<R>`
- `task.status` — execution outcome: `"done" | "fail" | "skip"`
- `task.error` — the thrown error if status is `"fail"`

The `status` operator is documented in `guides/using-task-status`, but `.result` and `.error` are not explained as properties of the task itself. There is no page that lists all three together.

Suggested location: a "Task output" section in `learn/quick-start`, or expand the existing `guides/using-task-status` guide.

---

## Gap 6 — `SpotValue<T>` utility type is undocumented

**Priority: low**

`SpotValue<T extends Spot<any>>` extracts the inner type from a `Spot<T>`. It is exported but not mentioned in `learn/typescript`.

What needs to be written: a brief entry in the TypeScript page alongside `TaskResult` and `TaskStatus`.

---

## Gap 7 — `ComposeLogger` type: `onStageStart` and `onStageComplete` are undocumented

**Priority: low**

`guides/handling-errors` only shows `onTaskFail`. The full logger interface has three callbacks:

```ts
type ComposeLogger = {
  onStageStart?: (event: { stage: number }) => void
  onTaskFail?: (event: { stage: number; task: Task<unknown>; error: unknown }) => void
  onStageComplete?: (event: { stage: number }) => void
}
```

`onStageStart` and `onStageComplete` are not documented anywhere.

Suggested location: expand `guides/handling-errors` or rename it to `guides/logging-and-errors`.

---

## Gap 8 — `guides/example.mdx` stub

**Priority: cleanup**

This file contains a Russian-language TODO list and no real content. It should be replaced with actual content (once gaps 1–3 are addressed) or deleted.

---

## Gap 9 — `reference/example.md` boilerplate

**Priority: cleanup**

This file is the default Starlight placeholder. It should either be replaced with a real API reference page or removed. The content for a real reference can be derived from gaps 1–7 above.

---

## Already documented — no action needed

- `createTask`, `createTag`, `bind`, `literal`, `enabled`, `compose().run()` basics — covered in `learn/quick-start`
- `status` operator — covered in `guides/using-task-status`
- `onTaskFail` — covered in `guides/handling-errors`
- `Scope.get()` — covered in `guides/getting-task-result`
- `graph()` — covered in `guides/inspecting-app-topology`
- Coupling patterns (Tags, direct deps, Literals) — covered in `guides/coupling-practices`
- Installation, linting, ESLint plugin, TypeScript basics — all covered
