import { createComputer, type Computer } from "@computable"
import { Context$, Dispatch$, Execute$, type RunnableInternal } from "@runnable"
import type { ComposeNode, Registry, Scope } from "./definition"
import { createObserver, type Dispatch } from "./observer"
import { createScope } from "./scope"

type Context = { computer: Computer; registry: Registry; dispatch: Dispatch }

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

  ctx.dispatch(stack, "enter")

  switch (current.type) {
    case "seq":
      for (const child of current.children) await traverse(ctx, [...stack, child])
      break

    case "con":
      await Promise.all(current.children.map((child) => traverse(ctx, [...stack, child])))
      break

    case "run":
      await execute(ctx, current.value as unknown as RunnableInternal) // safety: Execute$
      break
  }

  ctx.dispatch(stack, "exit")
}

const run = async (node: ComposeNode): Promise<Scope> => {
  const registry: Registry = new Map()

  const computer = createComputer(registry)
  const scope = createScope(computer)
  const dispatch = createObserver(scope)

  const ctx: Context = { computer, registry, dispatch }

  await traverse(ctx, [node])

  return scope
}

export { run }
