const alpha = createTask({
  name: "alpha",
  run: { fn: () => false },
})

const beta = createTask({
  name: "beta",
  run: {
    context: alpha.result,
    fn: (value) => (document.body.textContent = !value),
  },
})

compose()
  // 👇 Try commenting me
  .stage({ steps: [alpha] })
  .stage({ steps: [beta] })
  .run()
