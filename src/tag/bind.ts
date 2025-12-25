import { Meta$, type Meta } from "@meta"
import { RefID$, type Reference, type SpotContext } from "@spot"
import type { Tag } from "./create"

const Binding$ = Symbol("$binding")

type BindingInternal = { id: symbol; value: unknown }
type Binding = { [Binding$]: BindingInternal } & Meta

const bind = <T>(tag: Tag & Reference<T>, value: SpotContext<T>): Binding =>
  ({ [Binding$]: { id: tag[RefID$], value }, [Meta$]: { name: tag[Meta$].name } }) satisfies Binding

export { bind, Binding$, type Binding, type BindingInternal }
