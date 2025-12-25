import type { Name } from "@shared"

const Meta$ = Symbol("$meta")

type Meta = {
  [Meta$]: { name: Name }
}

export { Meta$, type Meta }
