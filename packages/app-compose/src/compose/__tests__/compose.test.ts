import { literal } from "@computable"
import { bind, createTag, createTask } from "@runnable"
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
      const tag = createTag<number>({ name: "alpha" })
      const app = compose().step(bind(tag, literal(1)))

      const message = `Unused Binding found with name Tag[alpha] in step root > #1.`

      expect(() => app.guard()).toThrowError(message)
    })

    it("throws on error graph", () => {
      const tag = createTag<number>({ name: "alpha" })

      const app = compose()
        .step(bind(tag, literal(1)))
        .step(bind(tag, literal(2)))

      const message = `A duplicate Binding found with name Tag[alpha] in step root > #2.`

      expect(() => app.guard()).toThrowError(message)
    })
  })

  describe("graph", () => {
    it("provides correct graph structure", () => {
      const task = createTask({ name: "task", run: { fn: () => {} } })
      const tag = createTag<number>({ name: "alpha" })

      const graph = compose()
        .meta({ name: "app" })
        .step(bind(tag, literal(1)))
        .step(task)
        .graph()

      const result = { type: "seq", meta: { name: "app" }, children: [{ type: "run" }, { type: "run" }] }
      expect(graph).toMatchObject(result)
    })
  })
})
