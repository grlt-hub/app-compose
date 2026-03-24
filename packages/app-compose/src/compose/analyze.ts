import { Context$, Dispatch$, type Binding, type Runnable, type RunnableInternal, type Task } from "@runnable"
import type { ComposableKind } from "./definition"
import { resolve, type Dependency } from "./resolver"

type RunnableMeta = { type: ComposableKind; display: { name: string }; writes: symbol[]; dependencies: Dependency }

type ComposeAnalyzer = {
  get: (runnable: RunnableInternal) => RunnableMeta
}

const analyze = (runnable: RunnableInternal): RunnableMeta => {
  const internal = runnable as RunnableInternal & (Task<unknown> | Binding)

  const writes = Object.getOwnPropertySymbols(internal[Dispatch$])
  const dependencies = resolve(internal[Context$])

  return { type: internal.kind, display: { name: internal.name }, writes, dependencies }
}

const createAnalyzer = (): ComposeAnalyzer => {
  const cache = new WeakMap<Runnable, RunnableMeta>()

  const get = (runnable: Runnable): RunnableMeta => {
    const analysis = cache.get(runnable) ?? analyze(runnable as RunnableInternal)
    return (cache.set(runnable, analysis), analysis)
  }

  return { get }
}

export { createAnalyzer }
