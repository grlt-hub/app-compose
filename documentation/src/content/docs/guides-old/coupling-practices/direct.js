import { createTask, compose } from "@grlt-hub/app-compose"

const alpha = createTask({
  name: "alpha",
  run: {
    fn: () => ({
      title: "This example uses a direct dependency",
    }),
  },
})

const beta = createTask({
  name: "beta",
  run: {
    fn: console.log,
    context: {
      title: alpha.title, // 👈
    },
  },
})

compose().stage([alpha]).stage([beta]).run()
