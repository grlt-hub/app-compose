import { literal } from "@computable"
import { LIBRARY_NAME } from "@shared"
import { describe, expect, it } from "vitest"
import { compose, Node$ } from "../../compose/compose"
import { run } from "../../compose/runner"
import { createWire, tag } from "../wire"

describe("createWire", () => {
  describe("in base no-shape mode", () => {
    it("wires up a spot to a single tag", async () => {
      const a = tag<number>("a")
      const wire = createWire({ from: literal(42), to: a })

      const app = compose().step(wire)

      const scope = await run(app[Node$])

      expect(scope.get(a.value)).toBe(42)
    })
  })

  describe("in gather mode", () => {
    it("wires merged spots into a single tag", async () => {
      const combined = tag<{ x: number; y: string }>("combined")

      const wire = createWire({
        from: { x: literal(42), y: literal("beta") },
        to: combined,
      })

      const app = compose().step(wire)
      const scope = await run(app[Node$])

      expect(scope.get(combined.value)).toStrictEqual({ x: 42, y: "beta" })
    })
  })

  describe("in spread mode", () => {
    it("wires a single spot into multiple tags", async () => {
      const a = tag<number>("a")
      const b = tag<string>("b")

      const wire = createWire({
        from: literal({ a: 42, b: "beta" }),
        to: { a, b },
      })

      const app = compose().step(wire)
      const scope = await run(app[Node$])

      expect(scope.get(a.value)).toBe(42)
      expect(scope.get(b.value)).toBe("beta")
    })
  })

  describe("in multi mode", () => {
    it("routes individual spots to their corresponding tags", async () => {
      const a = tag<number>("a")
      const b = tag<string>("b")

      const wire = createWire({
        from: { a: literal(5), b: literal("beta") },
        to: { a, b },
      })

      const app = compose().step(wire)
      const scope = await run(app[Node$])

      expect(scope.get(a.value)).toBe(5)
      expect(scope.get(b.value)).toBe("beta")
    })

    it("routes through nested structure", async () => {
      const a = tag<number>("a")
      const b = tag<string>("b")

      const wire = createWire({
        from: { nested: { a: literal(42) }, b: literal("beta") },
        to: { nested: { a }, b },
      })

      const app = compose().step(wire)
      const scope = await run(app[Node$])

      expect(scope.get(a.value)).toBe(42)
      expect(scope.get(b.value)).toBe("beta")
    })

    it("routes through a tuple structure", async () => {
      const a = tag<number>("a")
      const b = tag<string>("b")

      const wire = createWire({
        from: literal([42, "beta"] as [number, string]),
        to: [a, b],
      })

      const app = compose().step(wire)
      const scope = await run(app[Node$])

      expect(scope.get(a.value)).toBe(42)
      expect(scope.get(b.value)).toBe("beta")
    })
  })

  describe("validation", () => {
    it("throws on duplicate tag in destination", () => {
      const a = tag<number>("a")
      const error = `${LIBRARY_NAME} Duplicate tag "a" found in Wire destination.`

      expect(() => createWire({ from: literal({ x: 1, y: 2 }), to: { x: a, y: a } as any })).toThrow(error)
    })

    it("throws on invalid shape leaf", () => {
      const error = `${LIBRARY_NAME} Invalid shape not-a-tag provided to Wire at path "".`
      expect(() => createWire({ from: literal(1), to: "not-a-tag" as any })).toThrow(error)
    })

    it("throws on invalid shape leaf at nested path", () => {
      const a = tag<number>("a")
      const error = `${LIBRARY_NAME} Invalid shape 42 provided to Wire at path "b".`

      expect(() => createWire({ from: literal({ a: 1, b: 2 }), to: { a, b: 42 } as any })).toThrow(error)
    })
  })
})
