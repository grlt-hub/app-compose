import { compose } from "@compose"
import { literal, shape, type Spot } from "@computable"
import { createTask, createWire, tag } from "@runnable"
import { bench, describe, vi } from "vitest"

const double = (x: number) => x * 2

describe("multi layer, compute shapes", () => {
  const rootTag = tag<number>("root")
  const wire = createWire({ from: literal(1), to: rootTag })

  let app = compose().meta({ name: "bench" }).step(wire)

  let previous: Spot<number> = rootTag.value

  for (let layer = 0; layer < 20; layer++) {
    const l = shape({ layer: literal(layer), previous }, ({ layer, previous }) => layer + previous)

    const a = tag<number>(`${layer}:a`)
    const b = tag<number>(`${layer}:b`)
    const c = tag<number>(`${layer}:c`)
    const d = tag<number>(`${layer}:d`)

    const task = createTask({
      name: `${layer}:task`,
      run: {
        context: [a.value, b.value, c.value, d.value],
        fn: (list) => list.reduce((acc, x) => acc + x, 0),
      },
    })

    app = app
      .step([createWire({ from: shape(l, double), to: a }), createWire({ from: shape(l, double), to: b })])
      .step([createWire({ from: shape(l, double), to: c }), createWire({ from: shape(l, double), to: d })])
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
  let layer = compose()

  for (let i = 0; i < 100; i++) {
    const task = createTask({ name: `task:${i}`, run: { fn: vi.fn() } })

    layer = layer.step(task)
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
