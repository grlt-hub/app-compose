import type { Runnable, Task, Wire } from "@runnable"
import { describe, expectTypeOf, it } from "vitest"
import type { ComposeMeta, Scope } from "../definition"
import type { ComposeEvent, ComposeObserver } from "../observer"

describe("observer", () => {
  describe("ComposeObserver", () => {
    it("receives a readonly meta path", () => {
      type Expected = (event: ComposeEvent, path: readonly Readonly<ComposeMeta>[]) => void

      expectTypeOf<ComposeObserver>().toEqualTypeOf<Expected>()
    })
  })

  describe("ComposeEvent", () => {
    it("narrows a run node to its runnable", () => {
      expectTypeOf<ComposeEvent>().extract<{ node: "run" }>().toHaveProperty("runnable").toExtend<Runnable>()
    })

    it("run node is specific", () => {
      expectTypeOf<ComposeEvent>()
        .extract<{ node: "run" }>()
        .toHaveProperty("runnable")
        .extract<{ kind: "task" }>()
        .toExtend<Task<unknown>>()

      expectTypeOf<ComposeEvent>()
        .extract<{ node: "run" }>()
        .toHaveProperty("runnable")
        .extract<{ kind: "wire" }>()
        .toExtend<Wire>()
    })

    it("narrows a container node to its meta", () => {
      expectTypeOf<ComposeEvent>()
        .extract<{ node: "seq" | "con" }>()
        .toHaveProperty("meta")
        .toEqualTypeOf<Readonly<ComposeMeta> | undefined>()
    })

    it("provides scope access", () => {
      expectTypeOf<ComposeEvent>().toHaveProperty("scope").toEqualTypeOf<Scope>()
    })
  })
})
