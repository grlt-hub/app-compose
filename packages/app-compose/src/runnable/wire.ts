import type { ContextToSpot } from "@computable"
import { build, reference, type SpotProvider } from "@computable"
import { is } from "@is"
import { identity, isObject, LIBRARY_NAME } from "@shared"
import { Context$, Dispatch$, Execute$, type Runnable, type RunnableInternal, type RunnableKind } from "./definition"

const Tag$ = Symbol("$tag")

type Tag<T> = { [Tag$]: symbol; name: string; value: SpotProvider<T> }

const tag = <T = never>(name: string): Tag<T> => {
  const id = Symbol(`Tag[${name}]`)

  return { [Tag$]: id, name, value: reference.lensed<T>(id) }
}

type Wire = { name: string } & Runnable & RunnableKind<"wire">

type TagShape<T> =
  T extends Tag<unknown>
    ? T
    : T extends readonly unknown[]
      ? { [K in keyof T & number]: TagShape<T[K]> }
      : T extends Record<string, unknown>
        ? { [K in keyof T & string]: TagShape<T[K]> }
        : Tag<unknown>

type TagShapeToValue<S> = [S] extends [Tag<infer V>]
  ? V
  : S extends Record<string, unknown> | readonly unknown[]
    ? { [K in keyof S]: TagShapeToValue<S[K]> }
    : never

type WireConfig<S> = { from: NoInfer<ContextToSpot<TagShapeToValue<S>>>; to: S & TagShape<S> }

type WireEntry = { tag: Tag<unknown>; fn: (v: unknown) => unknown }

const pluck =
  (path: PropertyKey[]) =>
  (value: any): unknown =>
    path.reduce((acc, key) => acc?.[key], value)

function* walk(shape: unknown, path: PropertyKey[] = []): Generator<WireEntry> {
  if (is.tag(shape)) yield { tag: shape, fn: pluck(path) }
  else if (Array.isArray(shape))
    for (let index = 0; index < shape.length; index++) yield* walk(shape[index], [...path, index])
  else if (isObject(shape))
    for (const key of Object.keys(shape)) yield* walk(shape[key as keyof typeof shape], [...path, key])
  else throw new Error(`${LIBRARY_NAME} Invalid shape ${String(shape)} provided to Wire at path "${path.join(".")}".`)
}

const createWire = <const S>(config: WireConfig<S>): Wire => {
  const tags: Set<Tag<unknown>> = new Set()
  const dispatch: RunnableInternal[typeof Dispatch$] = {}

  for (const entry of walk(config.to))
    if (tags.has(entry.tag))
      throw new Error(`${LIBRARY_NAME} Duplicate tag "${entry.tag.name}" found in Wire destination.`)
    else void (tags.add(entry.tag), (dispatch[entry.tag[Tag$]] = entry.fn))

  const name = Array.from(tags)
    .map((tag) => tag.name)
    .join(" + ")

  return {
    name,
    kind: "wire",

    [Context$]: build(config.from),
    [Execute$]: identity,
    [Dispatch$]: dispatch,
  } as RunnableInternal & Wire
}

export { createWire, tag, Tag$, type Tag, type Wire }
