import type { Runnable } from "@runnable"
import { describe, expectTypeOf, it } from "vitest"
import type { ComposeMeta } from "../definition"
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
      expectTypeOf<ComposeEvent>().extract<{ node: "run" }>().toHaveProperty("runnable").toEqualTypeOf<Runnable>()
    })

    it("narrows a container node to its meta", () => {
      expectTypeOf<ComposeEvent>()
        .extract<{ node: "seq" | "con" }>()
        .toHaveProperty("meta")
        .toEqualTypeOf<Readonly<ComposeMeta> | undefined>()
    })
  })
})
