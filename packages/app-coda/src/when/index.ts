import type { Spot } from "@grlt-hub/app-compose"
import type { Quantifier } from "../createQuantifier"
import { every } from "../every"
import { not, type Not } from "../not"
import { some } from "../some"

type Result = { context: Spot<boolean>; fn: typeof Boolean }

type WhenQuantifier = Quantifier<Result>

const whenEvery: WhenQuantifier = (list, predicate) => ({ context: every(list, predicate), fn: Boolean })
whenEvery.status = (items, status) => ({ context: every.status(items, status), fn: Boolean })

const whenSome: WhenQuantifier = (list, predicate) => ({ context: some(list, predicate), fn: Boolean })
whenSome.status = (items, status) => ({ context: some.status(items, status), fn: Boolean })

type WhenNot = {
  (spot: Parameters<Not>[0]): Result
  every: WhenQuantifier
  some: WhenQuantifier
}

const whenNot: WhenNot = (spot) => ({ context: not(spot), fn: Boolean })

const whenNotEvery: WhenQuantifier = (list, predicate) => ({ context: not(every(list, predicate)), fn: Boolean })
whenNotEvery.status = (items, status) => ({ context: not(every.status(items, status)), fn: Boolean })

const whenNotSome: WhenQuantifier = (list, predicate) => ({ context: not(some(list, predicate)), fn: Boolean })
whenNotSome.status = (items, status) => ({ context: not(some.status(items, status)), fn: Boolean })

whenNot.every = whenNotEvery
whenNot.some = whenNotSome

const when = {
  every: whenEvery,
  some: whenSome,
  not: whenNot,
}

export { when }
