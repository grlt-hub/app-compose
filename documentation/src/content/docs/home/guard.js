const label = createTag({ name: "label" })

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
      // 👇 uncomment me
      //.stage({ steps: [bind(label, literal("World"))] })
      .stage({ steps: [greet] })
      .guard(),
  ).not.toThrow()
})
