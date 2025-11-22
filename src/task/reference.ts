import type { Lensable } from "@lens";
import type { Spot, SpotKind } from "@spot";

type Reference<T> = Spot<T> & SpotKind<'reference'> & Lensable;

export { type Reference }
