import { isObject } from "@shared"
import { Kind$, Optional$, RefID$ } from "@spot"
import { type TaskInternal } from "@task"
import type { Repository, SpotImpl } from "./types"

type Dependency = { required: Set<symbol>; optional: Set<symbol> }
type DependencyMap = Map<unknown, Dependency>

function* flatten(shape: unknown): Generator<SpotImpl, void, void> {
  if (isObject(shape))
    if (Kind$ in shape) yield shape as SpotImpl
    else for (const key of Object.keys(shape)) yield* flatten(shape[key as keyof typeof shape])
  else if (Array.isArray(shape)) for (const item of shape) yield* flatten(item)
  else throw new Error("unknown value" /* todo: better messaging */)
}

const resolve = (context: unknown): Dependency => {
  const required = new Set<symbol>()
  const optional = new Set<symbol>()

  for (const spot of flatten(context))
    switch (spot[Kind$]) {
      case "reference":
        if (spot[Optional$]) optional.add(spot[RefID$])
        else required.add(spot[RefID$])
    }

  return { required, optional: optional.difference(required) }
}

const createResolver = (repo: Repository) => {
  const deps: DependencyMap = new Map()

  const dependenciesOf = (context: unknown): Dependency => {
    if (!deps.has(context)) deps.set(context, resolve(context))
    return deps.get(context)!
  }

  const satisfies = (context: unknown) =>
    dependenciesOf(context)
      .required.values()
      .every((id) => repo.has(id))

  return { satisfies }
}

type Resolver = ReturnType<typeof createResolver>

export { createResolver, type Resolver }
