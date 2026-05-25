import { type Task, type Tag, type Spot, is, optional, literal, createTask, shape } from "@grlt-hub/app-compose"
import { LIBRARY_NAME } from "../shared"

type DebugOptions = {
  name: Task<unknown>["name"]
}

type DebugTarget = Task<unknown> | Tag<unknown> | Spot<unknown>

const safe = <T>(spot: Spot<T>) => optional(shape(spot, (x) => x))

const normalize = (head: DebugOptions | DebugTarget, tail: DebugTarget[]) =>
  !is.task(head) && !is.tag(head) && "name" in head
    ? {
        options: head,
        targets: tail,
      }
    : { options: { name: "" }, targets: [head, ...tail] }

function debug(opts: DebugOptions, ...targets: DebugTarget[]): Task<unknown>
function debug(...targets: DebugTarget[]): Task<unknown>
function debug(...args: [DebugOptions, ...DebugTarget[]] | DebugTarget[]): Task<unknown> {
  const [head, ...tail] = args
  const { options, targets } = normalize(head, tail as DebugTarget[])

  const context = targets.map((target) =>
    is.task(target)
      ? {
          title: literal(`[Task]: ${target.name}`),
          output: shape(
            { status: optional(target.status), result: optional(target.result), error: optional(target.error) },
            (x) => x,
          ),
        }
      : is.tag(target)
        ? { title: literal(`[Tag]: ${target.name}`), output: optional(target.value) }
        : { title: literal("[Spot]"), output: safe(target) },
  )

  const taskName = `${LIBRARY_NAME} debug ${options.name}`

  return createTask({
    name: taskName,
    run: {
      context,
      fn: (list) => {
        console.groupCollapsed(taskName)

        for (const target of list) {
          console.group(target.title)
          console.info(target.output)
          console.groupEnd()
        }

        console.groupEnd()
      },
    },
  })
}

export { debug }
