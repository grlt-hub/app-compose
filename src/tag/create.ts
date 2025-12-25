import { Meta$, type Name } from "@shared"
import { reference, type ReferenceProvider } from "@spot"

const Tag$ = Symbol("$tag")

type TagMeta = { name: Name }
type Tag = { [Tag$]: true } & { [Meta$]: TagMeta }
type TagConfig = { name: Name }

const createTag = <T = never>(config: TagConfig): ReferenceProvider<T> & Tag => {
  const id = Symbol(`Tag[${config.name}]`)
  const ref = reference<T>(id) as ReferenceProvider<T> & Tag

  ref[Tag$] = true
  ref[Meta$] = { name: config.name }

  return ref
}

export { createTag, type Tag }
