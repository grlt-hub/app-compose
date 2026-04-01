import { literal } from "@computable"
import { createTask, createWire, tag } from "@runnable"
import { LIBRARY_NAME } from "@shared"
import { describe, expect, it } from "vitest"
import { compose } from "../compose"

describe("compose", () => {
  describe("step", () => {
    it("rejects non-composable arguments", () => {
      const app = compose()
      const message = `${LIBRARY_NAME} Invalid argument passed to step.`

      expect(
        // @ts-expect-error
        () => app.step({ value: 123 }),
      ).toThrowError(message)
    })
  })

  describe("guard", () => {
    it("throws on warning graph", () => {
      const alpha = tag<number>("alpha")
      const wire = createWire({ from: literal(1), to: alpha })

      const app = compose().step(wire)

      const message = `Unused Wire found with name Wire[alpha] for Tag[alpha] in step root > #1.`

      expect(() => app.guard()).toThrowError(message)
    })

    it("throws on error graph", () => {
      const alpha = tag<number>("alpha")

      const app = compose()
        .step(createWire({ from: literal(1), to: alpha }))
        .step(createWire({ from: literal(2), to: alpha }))

      const message = `A duplicate Wire found with name Wire[alpha] in step root > #2.`

      expect(() => app.guard()).toThrowError(message)
    })
  })

  describe("graph", () => {
    it("provides correct graph structure", () => {
      const alpha = tag<number>("alpha")

      const task = createTask({ name: "task", run: { fn: () => {} } })
      const wire = createWire({ from: literal(1), to: alpha })

      const graph = compose().meta({ name: "app" }).step(wire).step(task).graph()

      const result = { type: "seq", meta: { name: "app" }, children: [{ type: "run" }, { type: "run" }] }
      expect(graph).toMatchObject(result)
    })
  })
})
