import { compose, createTask } from "@app-compose/core"

const auth = createTask({
  name: "auth",
  run: {
    fn: () => {
      throw new Error("Ooops!")
    },
  },
})

compose()
  .meta({
    name: "auth-page",
    hooks: {
      onTaskFail: (event) => {
        console.log(`Task ${event.task.name} failed`)
        console.log(`With an error: ${event.error}`)
      },
    },
  })
  .step(auth)
  .run()
