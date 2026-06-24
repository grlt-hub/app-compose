import type { Runnable } from "@runnable"
import { LIBRARY_NAME } from "@shared"
import type { ComposeMeta, ComposeNode } from "./definition"

type ComposePhase = "enter" | "exit"

type ReadonlyMeta = Readonly<ComposeMeta>

type ComposeEvent =
  | { node: "seq"; phase: "enter"; meta?: ReadonlyMeta }
  | { node: "seq"; phase: "exit"; meta?: ReadonlyMeta }
  | { node: "con"; phase: "enter"; meta?: ReadonlyMeta }
  | { node: "con"; phase: "exit"; meta?: ReadonlyMeta }
  | { node: "run"; phase: "enter"; runnable: Runnable }
  | { node: "run"; phase: "exit"; runnable: Runnable }

type ComposeObserver = (event: ComposeEvent, path: readonly ReadonlyMeta[]) => void

const toEvent = (node: ComposeNode, phase: ComposePhase): ComposeEvent => {
  switch (node.type) {
    case "seq":
    case "con":
      return { node: node.type, phase, meta: node.meta }
    case "run":
      return { node: "run", phase, runnable: node.value }
  }
}

const notify = (observe: ComposeObserver, event: ComposeEvent, path: readonly ReadonlyMeta[]): void => {
  try {
    /* USERLAND */ observe(event, path)
  } catch (error) {
    console.error(LIBRARY_NAME, error)
  }
}

const dispatch = (stack: ComposeNode[], phase: ComposePhase): void => {
  const event = toEvent(stack.at(-1)!, phase)
  const path: ReadonlyMeta[] = []

  for (const node of [...stack].reverse()) {
    const meta = "meta" in node ? node.meta : undefined

    if (meta) path.push(meta)
    if (meta?.observe) notify(meta.observe, event, /* copy, since we mutate */ [...path])
  }
}

export { dispatch, type ComposeEvent, type ComposeObserver }
