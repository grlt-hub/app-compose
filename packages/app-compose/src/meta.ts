import type { UnitName } from "@shared"

const Meta$ = Symbol("$meta")

type Meta = {
  [Meta$]: { name: UnitName }
}

export { Meta$, type Meta }
