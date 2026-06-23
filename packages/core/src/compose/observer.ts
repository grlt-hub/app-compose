import type { Runnable, RunnableKind } from "@runnable"
import { LIBRARY_NAME } from "@shared"
import type { ComposableKind, ComposeMeta, ComposeNode } from "./definition"

type ComposePhase = "enter" | "exit"

type RunnableEvent = Runnable & RunnableKind<ComposableKind>

type ComposeEvent =
  | { node: "seq"; phase: "enter"; meta?: ComposeMeta }
  | { node: "seq"; phase: "exit"; meta?: ComposeMeta }
  | { node: "con"; phase: "enter"; meta?: ComposeMeta }
  | { node: "con"; phase: "exit"; meta?: ComposeMeta }
  | { node: "run"; phase: "enter"; runnable: RunnableEvent }
  | { node: "run"; phase: "exit"; runnable: RunnableEvent }

type ComposeObserver = (event: ComposeEvent, path: readonly ComposeMeta[]) => void

const toEvent = (node: ComposeNode, phase: ComposePhase): ComposeEvent => {
  switch (node.type) {
    case "seq":
    case "con":
      return { node: node.type, phase, meta: node.meta }
    case "run":
      return { node: "run", phase, runnable: node.value as RunnableEvent }
  }
}

const notify = (observe: ComposeObserver, event: ComposeEvent, path: readonly ComposeMeta[]): void => {
  try {
    observe(event, path)
  } catch (error) {
    console.error(LIBRARY_NAME, error)
  }
}

const dispatch = (stack: ComposeNode[], phase: ComposePhase): void => {
  const event = toEvent(stack.at(-1)!, phase)
  const path: ComposeMeta[] = []

  for (const node of [...stack].reverse()) {
    const meta = "meta" in node ? node.meta : undefined

    if (meta) path.push(meta)
    if (meta?.observe) notify(meta.observe, event, /* copy to prevent our mutation from leaking out */ [...path])
  }
}

export { dispatch, type ComposeEvent, type ComposeObserver }
