import { describe, expect, it } from "vitest"
import { reference } from "../reference"

describe("lens", () => {
  it("cannot be modified", async () => {
    const id = Symbol()

    const x = reference.lensed<{ a: number }>(id)
    const a = reference<number>(id)

    // @ts-expect-error: x.a readonly by type, checking runtime error
    expect(() => (x.a = a)).toThrow("Modifying a Reference is not allowed.")
  })
})
