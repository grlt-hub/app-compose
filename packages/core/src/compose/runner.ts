import { createComputer, type Computer, type Spot, type SpotInternal } from "@computable"
import { Context$, Dispatch$, Execute$, type RunnableInternal } from "@runnable"
import type { ComposeNode, Registry } from "./definition"
import { dispatch } from "./observer"

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

  dispatch(stack, "enter")

  switch (current.type) {
    case "seq":
      for (const child of current.children) await traverse(ctx, [...stack, child])
      break

    case "con":
      await Promise.all(current.children.map((child) => traverse(ctx, [...stack, child])))
      break

    case "run":
      await execute(ctx, current.value as RunnableInternal)
      break
  }

  dispatch(stack, "exit")
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
