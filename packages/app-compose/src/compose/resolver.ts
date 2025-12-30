import { difference, isObject, LIBRARY_NAME } from "@shared"
import { Kind$, Optional$, RefID$ } from "@spot"
import type { Registry, SpotImpl } from "./types"

type Dependency = { required: Set<symbol>; optional: Set<symbol> }
type DependencyMap = Map<unknown, Dependency>

function* flatten(thing: unknown): Generator<SpotImpl, void, void> {
  if (isObject(thing))
    if (Kind$ in thing) yield thing as SpotImpl
    else for (const key of Object.keys(thing)) yield* flatten(thing[key as keyof typeof thing])
  else if (Array.isArray(thing)) for (const item of thing) yield* flatten(item)
  else /* unknown literal */ throw new Error(`${LIBRARY_NAME} Literal value found in context: ${String(thing)}.`)
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

  return { required, optional: difference(optional, required) }
}

const createResolver = (repo: Registry) => {
  const deps: DependencyMap = new Map()

  const dependenciesOf = (context: unknown): Dependency => {
    if (!deps.has(context)) deps.set(context, resolve(context))
    return deps.get(context)!
  }

  const satisfies = (context: unknown) => {
    const deps = Array.from(dependenciesOf(context).required)
    return deps.every((id) => repo.has(id))
  }

  return { dependenciesOf, satisfies }
}

type Resolver = ReturnType<typeof createResolver>

export { createResolver, type Resolver }
