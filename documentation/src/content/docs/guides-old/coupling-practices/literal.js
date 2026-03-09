import { createTask, literal, compose } from "@grlt-hub/app-compose"

const beta = createTask({
  name: "beta",
  run: {
    fn: console.log,
    context: {
      title: literal("This example uses a `literal`"), // 👈
    },
  },
})

compose().stage([beta]).run()
