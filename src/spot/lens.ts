import type { AnyRecord } from "@shared"
import type { AnySpot } from "./spot"

const RefID$ = Symbol("$lens.id")
const RefPath$ = Symbol("$lens.path")

const Self$ = Symbol(/* internal */)

type Lensable = { [RefID$]: symbol; [RefPath$]: string[] }

const raise = () => {
  // todo: meaningful message
  throw new Error()
}

const get: ProxyHandler<Lensable>["get"] = (target, property, recv) =>
  typeof property == "symbol"
    ? property === Self$
      ? target
      : Reflect.get(target, property, recv)
    : proxy({ ...target, [RefPath$]: target[RefPath$].concat(property) })

const set: ProxyHandler<Lensable>["set"] = (target, property, recv) =>
  typeof property == "symbol" ? Reflect.set(target, property, recv) : raise()

const proxy = (ref: Lensable) => new Proxy(ref, { get, set })

const lens = <T extends AnySpot>(spot: T, id: symbol): T & Lensable =>
  proxy({ ...spot, [RefPath$]: [], [RefID$]: id }) as T & Lensable

lens.is = (ref: AnyRecord): ref is Lensable => RefID$ in ref

lens.modify = <T extends Lensable, K extends keyof T>(ref: T, key: K, value: T[K]): T =>
  proxy({ ...(ref as any)[Self$], [key]: value }) as T

export { lens, RefID$, RefPath$, type Lensable }
