import { compose, createTask, createWire, shape, tag } from "@grlt-hub/app-compose"

const userName = tag<string>("userName")

const user = createTask({
  name: "user",
  run: {
    fn: () => ({ name: "John", role: "admin" }),
  },
})

const greeting = createTask({
  name: "greeting",
  run: {
    context: {
      name: userName.value,
    },
    fn: ({ name }) => console.log(`Welcome back, ${name}`),
  },
})

const userNameWire = createWire({
  from: shape(user.result, (u) => u.name.toUpperCase()),
  to: userName,
})

// oxfmt-ignore
compose()
  .step(user)
  .step(userNameWire)
  .step(greeting)
  .run()
