import { compose, createTask } from "@grlt-hub/app-compose"

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
      onComplete: (event) => {
        console.log(`${event.meta?.name} completed`)
      },
    },
  })
  .step(auth)
  .run()
