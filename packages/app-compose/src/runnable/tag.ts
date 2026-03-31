import type { ContextToSpot } from "@computable"
import { build, reference, type SpotProvider } from "@computable"
import { identity } from "@shared"
import { Context$, Dispatch$, Execute$, type Runnable, type RunnableInternal, type RunnableKind } from "./definition"

const Tag$ = Symbol("$tag")

type Tag<T> = { [Tag$]: symbol; name: string; value: SpotProvider<T> }

const tag = <T = never>(name: string): Tag<T> => {
  const id = Symbol(`Tag[${name}]`)

  return { [Tag$]: id, name, value: reference.lensed<T>(id) }
}

type Wire = { name: string } & Runnable & RunnableKind<"wire">

const createWire = <T>(tag: Tag<T>, value: ContextToSpot<T>): Wire => {
  const runnable: RunnableInternal & Wire = {
    name: tag.name,
    kind: "wire",

    [Context$]: build(value),
    [Execute$]: identity,
    [Dispatch$]: { [tag[Tag$]]: identity },
  }

  return runnable
}

export { createWire, tag, Tag$, type Tag, type Wire }
