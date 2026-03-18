import { type Tag, Tag$, type Task, Task$ } from "@runnable"
import { isObject } from "@shared"

const is = {
  tag: (x: unknown): x is Tag<unknown> => isObject(x) && Tag$ in x,
  task: (x: unknown): x is Task<unknown> => isObject(x) && Task$ in x,
}

export { is }
