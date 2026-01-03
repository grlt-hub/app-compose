const tag = createTag({ name: "title" })

const task = createTask({
  name: "page",
  run: {
    fn: ({ title }) => {
      document.body.innerHTML = `<h1>${title}</h1>`
    },
    context: { title: tag },
  },
})

const title = "Welcome to my app"

compose()
  .stage([bind(tag, literal(title))], [task])
  .run()
