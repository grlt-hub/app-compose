import { LIBRARY_NAME } from "@shared"
import { Compute$, type SpotInternal } from "./definition"

const Self$ = Symbol(/* internal */)

const raise = () => {
  throw new Error(`${LIBRARY_NAME} Modifying a Reference is not allowed.`)
}

const get: ProxyHandler<SpotInternal>["get"] = (target, property, recv) =>
  typeof property === "string"
    ? proxy({ ...target, [Compute$]: target[Compute$].concat((value: any) => value?.[property]) })
    : property === Self$
      ? target
      : Reflect.get(target, property, recv)

const set: ProxyHandler<SpotInternal>["set"] = () => raise()

export const proxy = <T extends SpotInternal>(ref: T): T => new Proxy<T>(ref, { get, set })

proxy.self = <T extends SpotInternal>(lensable: T): T => (lensable as any)[Self$] ?? lensable
