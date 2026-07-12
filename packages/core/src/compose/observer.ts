import { LIBRARY_NAME } from "@shared"
import type { ComposeMeta, ComposeNode, KnownRunnable, Scope } from "./definition"

type ComposePhase = "enter" | "exit"

type ReadonlyMeta = Readonly<ComposeMeta>

type ComposeEvent =
  | { node: "seq"; scope: Scope; phase: "enter"; meta?: ReadonlyMeta }
  | { node: "seq"; scope: Scope; phase: "exit"; meta?: ReadonlyMeta }
  | { node: "con"; scope: Scope; phase: "enter"; meta?: ReadonlyMeta }
  | { node: "con"; scope: Scope; phase: "exit"; meta?: ReadonlyMeta }
  | { node: "run"; scope: Scope; phase: "enter"; runnable: KnownRunnable }
  | { node: "run"; scope: Scope; phase: "exit"; runnable: KnownRunnable }

type Dispatch = (stack: ComposeNode[], phase: ComposePhase) => void
type ComposeObserver = (event: ComposeEvent, path: readonly ReadonlyMeta[]) => void

const toEvent = (node: ComposeNode, scope: Scope, phase: ComposePhase): ComposeEvent => {
  switch (node.type) {
    case "seq":
      return { node: "seq", scope, phase, meta: node.meta }
    case "con":
      return { node: "con", scope, phase, meta: node.meta }
    case "run":
      return { node: "run", scope, phase, runnable: node.value as KnownRunnable }
  }
}

const notify = (observe: ComposeObserver, event: ComposeEvent, path: readonly ReadonlyMeta[]): void => {
  try {
    /* USERLAND */ observe(event, path)
  } catch (error) {
    console.error(LIBRARY_NAME, error)
  }
}

const createObserver =
  (scope: Scope): Dispatch =>
  (stack, phase): void => {
    const event = toEvent(stack.at(-1)!, scope, phase)
    const path: ReadonlyMeta[] = []

    for (const node of [...stack].reverse()) {
      const meta = "meta" in node ? node.meta : undefined

      if (meta) path.push(meta)
      if (meta?.observe) notify(meta.observe, event, /* copy, since we mutate */ [...path])
    }
  }

export { createObserver, type ComposeEvent, type ComposeObserver, type Dispatch }
