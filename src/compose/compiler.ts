import { isObject, path, type AnyRecord } from "@shared"
import { Kind$, Literal$, RefID$, RefPath$ } from "@spot"
import type { Registry, SpotImpl } from "./types"

const createCompiler = (repo: Registry) => {
  const read = (spot: SpotImpl): unknown => {
    switch (spot[Kind$]) {
      case "literal":
        return spot[Literal$]

      case "reference":
        return path(repo.get(spot[RefID$]), spot[RefPath$])

      default:
        const _: never = /* exhaustive */ spot
    }
  }

  const record = (shape: AnyRecord) => {
    const out: any = {}

    for (const key of Object.keys(shape)) out[key] = anything(shape[key])

    return out
  }

  const anything = (thing: unknown): unknown => {
    if (isObject(thing))
      if (Kind$ in thing) return read(thing as SpotImpl)
      else return record(thing /* todo: check safety? */ as AnyRecord)
    else if (Array.isArray(thing)) return thing.map(anything)
    else /* unknown literal */ throw new Error("unknown value" /* todo: better messaging */)
  }

  return { build: anything }
}

type Compiler = ReturnType<typeof createCompiler>

export { createCompiler, type Compiler }
