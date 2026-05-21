import type { Spot } from "@grlt-hub/app-compose"
import { createQuantifier, type Quantifier } from "../createQuantifier"

type Result = { context: Spot<boolean>; fn: typeof Boolean }

const createWhen = (mode: "some" | "every") => {
  const q = createQuantifier(mode)

  const when: Quantifier<Result> = (list, predicate) => ({ context: q(list, predicate), fn: Boolean })
  when.status = (items, status) => ({ context: q.status(items, status), fn: Boolean })

  return when
}

export { createWhen }
