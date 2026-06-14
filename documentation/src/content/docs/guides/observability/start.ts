import { compose, createTask } from "@app-compose/core"

const auth = createTask({
  name: "auth",
  run: {
    fn: () => {
      console.log("auth ran")
      return { id: 1 }
    },
  },
})

compose()
  .meta({
    name: "auth-page",
    hooks: {
      onStart: (event) => {
        console.log(`${event.meta?.name} started`)
      },
    },
  })
  .step(auth)
  .run()
