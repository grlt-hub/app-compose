import { createTag, createTask, compose } from "@grlt-hub/app-compose"

const tag = createTag({ name: "title" })

const alpha = createTask({
  name: "alpha",
  run: {
    fn: () => ({ title: "This example uses a Tag" }),
  },
})

const beta = createTask({
  name: "beta",
  run: {
    fn: console.log,
    context: {
      title: tag, // 👈
    },
  },
})

compose()
  .stage([alpha])
  .stage([bind(tag, alpha.title)])
  .stage([beta])
  .run()
