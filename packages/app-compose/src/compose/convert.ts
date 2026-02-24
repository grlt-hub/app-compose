import { Dispatch$, type Binding, type Runnable, type RunnableInternal, type Task } from "@runnable"

const toID = (step: Runnable) => {
  const internal = step as RunnableInternal & (Task<unknown> | Binding)

  const writes = Object.getOwnPropertySymbols(internal[Dispatch$])

  return { type: internal.kind, display: { name: internal.name }, writes }
}

export { toID }
