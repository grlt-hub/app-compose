const apiUrl = tag("apiUrl")

const auth = createTask({
  name: "auth",
  run: { fn: () => {} },
})

const apiUrlWire = createWire({
  from: literal(""),
  to: apiUrl,
})

describe("is", () => {
  it("is.tag", () => {
    expect(is.tag(apiUrl)).toBeTruthy()
    expect(is.tag(auth)).toBeFalsy()
    expect(is.tag(apiUrlWire)).toBeFalsy()
  })

  it("is.task", () => {
    expect(is.task(auth)).toBeTruthy()
    expect(is.task(apiUrl)).toBeFalsy()
    expect(is.task(apiUrlWire)).toBeFalsy()
  })

  it("is.wire", () => {
    expect(is.wire(apiUrlWire)).toBeTruthy()
    expect(is.wire(auth)).toBeFalsy()
    expect(is.wire(apiUrl)).toBeFalsy()
  })

  it("is.runnable", () => {
    expect(is.runnable(apiUrlWire)).toBeTruthy()
    expect(is.runnable(auth)).toBeTruthy()
    expect(is.runnable(apiUrl)).toBeFalsy()
  })
})
