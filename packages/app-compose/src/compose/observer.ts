import type { RunnableInternal, RunnableKind, Task, TaskExecutionValue } from "@runnable"
import type { ComposableKind, ComposeMeta, ComposeNode } from "./definition"

type ObserverEvent =
  | { type: "node:start"; stack: ComposeNode[] }
  | { type: "node:complete"; stack: ComposeNode[] }
  | { type: "execute:complete"; stack: ComposeNode[]; runnable: RunnableInternal; value: unknown }

type ComposeHookMap = {
  onStart: (event: { meta?: ComposeMeta }) => void
  onComplete: (event: { meta?: ComposeMeta }) => void

  onTaskFail: (event: { task: Task<unknown>; error: unknown }) => void
}

const eventToUserland = {
  onTaskFail: (event: ObserverEvent & { type: "execute:complete" }) => {
    const runnable = event.runnable as RunnableInternal & RunnableKind<ComposableKind>
    const result = event.value as TaskExecutionValue<unknown>

    if (runnable.kind === "task" && result.status === "fail")
      return { task: runnable as unknown as Task<unknown>, error: result.error }
    else return null
  },
}

const observe = (event: ObserverEvent) => {
  let userland
  const current = event.stack.at(-1)!

  switch (event.type) {
    case "node:start":
      if ("meta" in current) current.meta?.hooks?.onStart?.({ meta: current.meta })
      break

    case "node:complete":
      if ("meta" in current) current.meta?.hooks?.onComplete?.({ meta: current.meta })
      break

    case "execute:complete":
      if ((userland = eventToUserland.onTaskFail(event)))
        for (const node of event.stack) if ("meta" in node) node.meta?.hooks?.onTaskFail?.(userland)
      break
  }
}

export { observe, type ComposeHookMap }
