import { Context$, Dispatch$, type Runnable, type RunnableInternal } from "@runnable"
import type { ComposableKind, KnownRunnable } from "./definition"
import { resolve, type Dependency } from "./resolver"

type RunnableMeta = { type: ComposableKind; display: { name: string }; writes: symbol[]; dependencies: Dependency }

type RunnableRepr = Runnable | RunnableInternal
type ComposeAnalyzer = { get: (runnable: RunnableRepr) => RunnableMeta }

const analyze = (runnable: RunnableRepr): RunnableMeta => {
  const internal = runnable as RunnableInternal & KnownRunnable

  const writes = Object.getOwnPropertySymbols(internal[Dispatch$])
  const dependencies = resolve(internal[Context$])

  return { type: internal.kind, display: { name: internal.name }, writes, dependencies }
}

const createAnalyzer = (): ComposeAnalyzer => {
  const cache = new WeakMap<RunnableRepr, RunnableMeta>()

  const get = (runnable: RunnableRepr): RunnableMeta => {
    const analysis = cache.get(runnable) ?? analyze(runnable)
    return (cache.set(runnable, analysis), analysis)
  }

  return { get }
}

export { createAnalyzer }
