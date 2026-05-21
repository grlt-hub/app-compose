import {
  is,
  optional,
  shape,
  type Spot,
  type SpotValue,
  type Tag,
  type Task,
  type TaskResult,
  type TaskStatus,
} from "@grlt-hub/app-compose"

type TaskValue<T> = { result: TaskResult<T>; status: TaskStatus; error: SpotValue<Task<T>["error"]> }

type ItemValue<T> =
  T extends Task<unknown> ? TaskValue<T> : T extends Tag<infer V> ? V : T extends Spot<infer V> ? V : never

const createQuantifier = (mode: "some" | "every") => {
  const quantifier = <const List extends readonly (Task<unknown> | Tag<unknown> | Spot<unknown>)[]>(
    list: List,
    predicate: (state: ItemValue<List[number]>) => boolean,
  ): Spot<boolean> =>
    shape(
      list.map((item) =>
        is.tag(item)
          ? item.value
          : is.task(item)
            ? { result: item.result, status: item.status, error: optional(item.error) }
            : item,
      ),
      (values) => values[mode](predicate as (v: any) => boolean),
    )

  quantifier.status = <const Items extends readonly (Task<unknown> | Spot<TaskStatus | undefined>)[]>(
    items: Items,
    status: TaskStatus,
  ): Spot<boolean> =>
    shape(
      items.map((item) => (is.task(item) ? item.status : item)),
      (statuses) => statuses[mode]((s) => s === status),
    )

  return quantifier
}

export { createQuantifier }
