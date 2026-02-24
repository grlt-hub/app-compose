import { Build$, Literal$, Optional$, Read$, Spot$, type SpotInternal } from "@computable"
import { isObject, LIBRARY_NAME } from "@shared"

type Dependency = { required: Set<symbol>; optional: Set<symbol> }
type DependencyEntry = { id: symbol; optional: boolean }

function* scanShape(shape: unknown): Generator<DependencyEntry, void, void> {
  if (isObject(shape))
    if (Spot$ in shape) yield* scanSpot(shape as SpotInternal)
    else for (const key of Object.keys(shape)) yield* scanShape(shape[key as keyof typeof shape])
  else if (Array.isArray(shape)) for (const item of shape) yield* scanShape(item)
  else throw new Error(`${LIBRARY_NAME} Literal value found in context: ${String(shape)}.`)
}

function* scanSpot(spot: SpotInternal): Generator<DependencyEntry, void, void> {
  if (Literal$ in spot) return
  else if (Read$ in spot) return yield { id: spot[Read$], optional: spot[Optional$] }
  else if (Build$ in spot)
    for (const entry of scanShape(spot[Build$])) yield { id: entry.id, optional: entry.optional || spot[Optional$] }
  else throw /* unknown unit */ new Error(`${LIBRARY_NAME} Invalid Unit.`)
}

function resolve(spot: SpotInternal): Dependency {
  const required = new Set<symbol>()
  const optional = new Set<symbol>()

  for (const entry of scanSpot(spot))
    if (entry.optional) optional.add(entry.id)
    else required.add(entry.id)

  return { required, optional }
}

export { resolve }
