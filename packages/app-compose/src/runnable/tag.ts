import type { ContextToSpot } from "@computable"
import { build, reference, type SpotProvider } from "@computable"
import { identity } from "@shared"
import { Context$, Dispatch$, Execute$, type Runnable, type RunnableInternal, type RunnableKind } from "./definition"

const Tag$ = Symbol("$tag")

type Tag<T> = { [Tag$]: symbol; name: string; value: SpotProvider<T> }
type TagConfig = { name: string }

const createTag = <T = never>(config: TagConfig): Tag<T> => {
  const id = Symbol(`Tag[${config.name}]`)

  const tag: Tag<T> = { [Tag$]: id, name: config.name, value: reference.lensed<T>(id) }

  return tag
}

type Binding = { name: string } & Runnable & RunnableKind<"binding">

const bind = <T>(tag: Tag<T>, value: ContextToSpot<T>): Binding => {
  const runnable: RunnableInternal & Binding = {
    name: tag.name,
    kind: "binding",

    [Context$]: build(value),
    [Execute$]: identity,
    [Dispatch$]: { [tag[Tag$]]: identity },
  }

  return runnable
}

export { bind, createTag, Tag$, type Binding, type Tag, }
