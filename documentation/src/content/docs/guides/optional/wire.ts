import { compose, createTask, createWire, optional, tag } from "@grlt-hub/app-compose"

const userName = tag<string | undefined>("userName")

const user = createTask({
  name: "user",
  run: {
    fn: () => ({ name: "John" }),
  },
})

const greeting = createTask({
  name: "greeting",
  run: {
    context: {
      name: userName.value,
    },
    fn: ({ name }) => {
      console.log(`Welcome back, ${name ?? "<unknown-user>"}`)
    },
  },
})

const userNameWire = createWire({
  from: optional(user.result.name), // 👈
  to: userName,
})

// oxfmt-ignore
compose()
  // 👇 comment — greeting → "<unknown-user>"
  .step(user)
  .step(userNameWire)
  .step(greeting)
  .run()
