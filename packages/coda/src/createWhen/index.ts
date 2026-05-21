import type { Spot } from "@grlt-hub/app-compose"
import { createQuantifier, type Quantifier } from "../createQuantifier"

type Result = { context: Spot<boolean>; fn: typeof Boolean }

const createWhen = (mode: "some" | "every"): Quantifier<Result> => {
  const q = createQuantifier(mode)

  const when: Quantifier<Result> = (list, predicate) => ({ fn: Boolean, context: q(list, predicate) })
  when.status = (items, status) => ({ fn: Boolean, context: q.status(items, status) })

  return when
}

export { createWhen }
