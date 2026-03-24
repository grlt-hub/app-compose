import { createComputer, type Computer, type Spot, type SpotInternal } from "@computable"
import { Context$, Dispatch$, Execute$, type RunnableInternal } from "@runnable"
import type { ComposeNode, Registry } from "./definition"
import { observe } from "./observer"

type Context = { computer: Computer; registry: Registry }
type Scope = { get: <T>(spot: Spot<T>) => T | undefined }

const execute = (ctx: Context, runnable: RunnableInternal): Promise<unknown> =>
  Promise.resolve()
    .then(() => ctx.computer.compute(runnable[Context$]))
    .then((value) => runnable[Execute$](value))
    .then((value) => {
      for (const key of Object.getOwnPropertySymbols(runnable[Dispatch$]))
        ctx.registry.set(key, runnable[Dispatch$][key]!(value))
      return value
    })

const traverse = async (ctx: Context, stack: ComposeNode[]) => {
  const current = stack.at(-1)!

  observe({ type: "node:start", stack })

  switch (current.type) {
    case "seq":
      for (const child of current.children) await traverse(ctx, [...stack, child])
      break

    case "con":
      await Promise.all(current.children.map((child) => traverse(ctx, [...stack, child])))
      break

    case "run":
      const runnable = current.value as RunnableInternal

      await execute(ctx, runnable).then((value) => observe({ type: "execute:complete", stack, runnable, value }))

      break
  }

  observe({ type: "node:complete", stack })
}

const run = async (node: ComposeNode): Promise<Scope> => {
  const registry: Registry = new Map()
  const computer = createComputer(registry)

  const ctx: Context = { computer, registry }

  await traverse(ctx, [node])

  return {
    get: <T>(spot: Spot<T>): T | undefined => computer.computeSafe(spot as SpotInternal<T>),
  }
}

export { run, type Scope }
