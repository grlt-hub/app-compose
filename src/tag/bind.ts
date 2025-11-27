import { RefID$, type Reference, type Spot, type SpotContext } from "@spot"
import type { Tag } from "./create"

const Binding$ = Symbol("$binding")

type BindingInternal = { id: symbol; value: unknown }
type Binding = { [Binding$]: BindingInternal }

const bind = <T>(tag: Tag & Reference<T>, value: SpotContext<T>): Binding =>
  ({ [Binding$]: { id: tag[RefID$], value } }) satisfies Binding

export { bind, Binding$, type Binding, type BindingInternal }
