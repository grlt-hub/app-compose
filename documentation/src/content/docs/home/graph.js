const tag = createTag({ name: "title" })

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ list: [0], title: "hello" }) },
})

const beta = createTask({
  name: "beta",
  run: {
    fn: (title) => console.log(title),
    context: { title: tag },
  },
})

const gamma = createTask({
  name: "gamma",
  run: {
    fn: (list) => console.log(list),
    context: { list: optional(alpha.list) },
  },
})

compose()
  .stage([alpha])
  .stage([bind(tag, alpha.title)])
  .stage([beta, gamma])
  .graph()
  .then((graph) => {
    console.log(JSON.stringify(graph, null, 2))
  })
