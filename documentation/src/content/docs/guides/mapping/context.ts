import { compose, createTask, shape } from "@grlt-hub/app-compose"

const user = createTask({
  name: "user",
  run: {
    fn: () => ({ name: "John", role: "admin" }),
  },
})

const greeting = createTask({
  name: "greeting",
  run: {
    // run.context
    context: {
      name: shape(user.result, (u) => u.name.toUpperCase()),
    },
    fn: ({ name }) => console.log(`Welcome back, ${name}`),
  },
})

const adminPanel = createTask({
  name: "admin-panel",
  run: {
    fn: () => console.log("Admin panel ready"),
  },
  enabled: {
    // enabled.context
    context: {
      isAdmin: shape(user.result, (u) => u.role === "admin"),
    },
    fn: ({ isAdmin }) => isAdmin,
  },
})

// oxfmt-ignore
compose()
  .step(user)
  .step([greeting, adminPanel])
  .run()
