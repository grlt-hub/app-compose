import { literal, shape, type Spot } from "@computable"
import { bind, createTag, createTask } from "@runnable"
import { bench, describe, vi } from "vitest"
import { compose } from "../compose"

const double = (x: number) => x * 2

describe("multi layer, compute shapes", () => {
  const rootTag = createTag<number>({ name: "root" })

  const app = compose()
    .meta({ name: "bench" })
    .step(bind(rootTag, literal(1)))

  let previous: Spot<number> = rootTag.value

  for (let layer = 0; layer < 20; layer++) {
    const l = shape({ layer: literal(layer), previous }, ({ layer, previous }) => layer + previous)

    const a = createTag<number>({ name: `${layer}:a` })
    const b = createTag<number>({ name: `${layer}:b` })
    const c = createTag<number>({ name: `${layer}:c` })
    const d = createTag<number>({ name: `${layer}:d` })

    const task = createTask({
      name: `${layer}:task`,
      run: {
        context: [a.value, b.value, c.value, d.value],
        fn: (list) => list.reduce((acc, x) => acc + x, 0),
      },
    })

    app
      .step([bind(a, shape(l, double)), bind(b, shape(l, double))])
      .step([bind(c, shape(l, double)), bind(d, shape(l, double))])
      .step(task)

    previous = task.result
  }

  describe("compose.guard", () => {
    bench("app", () => void app.guard(), { time: 1000 })
  })

  describe("compose.graph", () => {
    bench("app", () => void app.graph(), { time: 1000 })
  })
})

describe("single layer, wide sequence", () => {
  const layer = compose()

  for (let i = 0; i < 100; i++) {
    const task = createTask({ name: `task:${i}`, run: { fn: vi.fn() } })

    layer.step(task)
  }

  const app = compose().meta({ name: "bench" }).step(layer)

  describe("compose.guard", () => {
    bench("app", () => void app.guard(), { time: 1000 })
  })

  describe("compose.graph", () => {
    bench("app", () => void app.graph(), { time: 1000 })
  })
})

describe("multi layer, deep nesting", () => {
  let current = compose().meta({ name: "root" })
  let previous: Spot<number> = literal(1)

  for (let layer = 0; layer < 100; layer++) {
    const task = createTask({ name: `task:${layer}`, run: { fn: (v) => v + 1, context: previous } })

    current = compose()
      .meta({ name: `layer:${layer}` })
      .step(current)
      .step(task)

    previous = task.result
  }

  const app = current

  describe("compose.guard", () => {
    bench("app", () => void app.guard(), { time: 1000 })
  })

  describe("compose.graph", () => {
    bench("app", () => void app.graph(), { time: 1000 })
  })
})
