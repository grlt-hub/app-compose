import type { AnyRecord } from "@shared"
import { lens, type Lensable } from "./lens"
import { Kind$, Optional$, type Spot, type SpotKind, type SpotOptional } from "./spot"

type Reference<T> = Spot<T> & SpotKind<"reference"> & SpotOptional & Lensable

type ReferenceProvider<T> = T extends AnyRecord
  ? { [Key in keyof T]: ReferenceProvider<T[Key]> } & Reference<T>
  : Reference<T>

const reference = <T>(id: symbol): ReferenceProvider<T> => {
  const spot: Omit<Reference<T>, keyof Lensable> = { [Kind$]: "reference" as const, [Optional$]: false }

  return lens(spot, id) as ReferenceProvider<T>
}

export { reference, type Reference, type ReferenceProvider }
