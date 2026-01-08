const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ result: false }) },
})

const beta = createTask({
  name: "beta",
  run: {
    fn: ({ value }) => (document.body.textContent = !value),
    context: { value: alpha.result },
  },
})

compose()
  // 👇 Try commenting me
  .stage([alpha])
  .stage([beta])
  .run()
