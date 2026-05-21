import { describe, expect, it } from "vitest"
import { parseVersion } from "../parse-version"

describe("parseVersion", () => {
  it.each([["0.0.0"], ["1.2.3"], ["10.20.30"], ["1.0.0"], ["100.200.300"]])("stable: %s", (v) => {
    expect(parseVersion(v)).toEqual({ ok: true, tag: undefined })
  })

  it.each([
    ["1.2.3-next.0", "next"],
    ["1.2.3-next.42", "next"],
    ["1.2.3-alpha.0", "alpha"],
    ["1.2.3-alpha.5", "alpha"],
    ["1.2.3-beta.0", "beta"],
    ["1.2.3-beta.99", "beta"],
  ] as const)("prerelease: %s -> %s", (v, tag) => {
    expect(parseVersion(v)).toEqual({ ok: true, tag })
  })

  it.each([
    [""],
    ["1.2"],
    ["1.2.3.4"],
    ["v1.2.3"],
    ["01.2.3"],
    ["1.02.3"],
    ["1.2.03"],
    ["1.2.3-"],
    ["1.2.3-beta"],
    ["1.2.3-beta."],
    ["1.2.3-beta.x"],
    ["1.2.3-beta.01"],
    ["1.2.3-rc.1"],
    ["1.2.3-Beta.1"],
    ["1.2.3+sha"],
    ["1.2.3-beta.1+sha"],
    [" 1.2.3"],
    ["1.2.3 "],
    ["a.b.c"],
  ])("rejects: %j", (input) => {
    expect(parseVersion(input)).toEqual({ ok: false })
  })
})
