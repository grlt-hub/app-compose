import { RefID$, type Reference, type Spot, type SpotContext } from "@spot"
import type { Tag } from "./create"

const BindTo$ = Symbol("$bind.to")
const BindValue$ = Symbol("$bind.value")

type Binding = { [BindTo$]: symbol; [BindValue$]: unknown }

const bind = <T>(tag: Tag & Reference<T>, value: SpotContext<T>): Binding =>
  ({ [BindTo$]: tag[RefID$], [BindValue$]: value }) satisfies Binding

export { bind, BindTo$, BindValue$, type Binding }
