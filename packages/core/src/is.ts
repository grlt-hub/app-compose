import { Execute$, type Runnable, type RunnableKind, type Tag, Tag$, type Task, type Wire } from "@runnable"
import { isObject } from "@shared"

const is = {
  tag: (x: unknown): x is Tag<unknown> => isObject(x) && Tag$ in x,
  runnable: (x: unknown): x is Runnable & RunnableKind<string> => isObject(x) && Execute$ in x,

  task: (x: unknown): x is Task<unknown> => is.runnable(x) && x.kind === "task",
  wire: (x: unknown): x is Wire => is.runnable(x) && x.kind === "wire",
}

export { is }
