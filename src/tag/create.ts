import { reference, type ReferenceProvider } from "@spot"

const Tag$ = Symbol("$tag")

type Tag = { [Tag$]: true }

type TagConfig = { id?: string }

const createTag = <T = never>(config: TagConfig = {}): ReferenceProvider<T> & Tag => {
  const id = config.id ? Symbol(`Tag[${config.id}]`) : Symbol()
  const ref = reference<T>(id) as ReferenceProvider<T> & Tag

  ref[Tag$] = true

  return ref
}

export { createTag, type Tag }
