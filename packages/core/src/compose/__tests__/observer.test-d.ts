import type { Runnable, RunnableKind } from "@runnable"
import { describe, expectTypeOf, it } from "vitest"
import type { ComposableKind, ComposeMeta } from "../definition"
import type { ComposeEvent, ComposeObserver } from "../observer"

describe("observer", () => {
  describe("ComposeObserver", () => {
    it("receives a readonly meta path", () => {
      type Expected = (event: ComposeEvent, path: readonly ComposeMeta[]) => void

      expectTypeOf<ComposeObserver>().toEqualTypeOf<Expected>()
    })
  })

  describe("ComposeEvent", () => {
    it("narrows a run node to its runnable", () => {
      expectTypeOf<ComposeEvent>()
        .extract<{ node: "run" }>()
        .toHaveProperty("runnable")
        .toEqualTypeOf<Runnable & RunnableKind<ComposableKind>>()
    })

    it("narrows a container node to its meta", () => {
      expectTypeOf<ComposeEvent>()
        .extract<{ node: "seq" | "con" }>()
        .toHaveProperty("meta")
        .toEqualTypeOf<ComposeMeta | undefined>()
    })
  })
})
