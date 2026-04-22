const label = tag("label")

const greet = createTask({
  name: "greet",
  run: {
    context: label.value,
    fn: (label) => console.log(`Hello, ${label}!`),
  },
})

test("catches missing context before runtime", () => {
  expect(() =>
    compose()
      // 👇 comment me
      .step(createWire({ to: label, from: literal("World") }))
      .step(greet)
      .guard(),
  ).not.toThrow()
})
