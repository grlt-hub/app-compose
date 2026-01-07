import type { AnyRecord } from "@shared"
import { lens, type Lensable } from "./lens"
import { Kind$, Map$, Optional$, type Spot, type SpotKind, type SpotMap, type SpotOptional } from "./spot"

type Reference<T> = Spot<T> & SpotKind<"reference"> & SpotOptional & Lensable & SpotMap<T>

type ReferenceProvider<T> = T extends AnyRecord
  ? { [Key in keyof T]: ReferenceProvider<T[Key]> } & Reference<T>
  : Reference<T>

const reference = <T, S = T>(id: symbol, map?: (value: S) => T): ReferenceProvider<T> => {
  const spot: Omit<Reference<T>, keyof Lensable> = {
    [Kind$]: "reference" as const,
    [Optional$]: false,
    ...(map && { [Map$]: map }),
  }

  return lens(spot, id) as ReferenceProvider<T>
}

export { reference, type Reference, type ReferenceProvider }
