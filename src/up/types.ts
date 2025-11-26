import type { Literal, Reference } from "@spot"

type SpotImpl<T = unknown> = Literal<T> | Reference<T>
type Repository = Map<symbol, any>

export { type Repository, type SpotImpl }
