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
} from "@app-compose/core"

type TaskValue<T> = { result: TaskResult<T>; status: TaskStatus; error: SpotValue<Task<T>["error"]> }

type ItemValue<T> =
  T extends Task<unknown> ? TaskValue<T> : T extends Tag<infer V> ? V : T extends Spot<infer V> ? V : never

type Quantifier<R> = {
  <const List extends readonly (Task<unknown> | Tag<unknown> | Spot<unknown>)[]>(
    list: List,
    predicate: (values: ItemValue<List[number]>) => boolean,
  ): R
  status: <const Items extends readonly (Task<unknown> | Spot<TaskStatus | undefined>)[]>(
    items: Items,
    status: TaskStatus,
  ) => R
}

const createQuantifier = (mode: "some" | "every"): Quantifier<Spot<boolean>> => {
  const quantifier: Quantifier<Spot<boolean>> = (list, predicate) =>
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

  quantifier.status = (items, status) =>
    shape(
      items.map((item) => (is.task(item) ? item.status : item)),
      (statuses) => statuses[mode]((s) => s === status),
    )

  return quantifier
}

export { createQuantifier, type Quantifier }
