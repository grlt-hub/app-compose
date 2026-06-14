import { compose, createTask, createWire, optional, shape, tag } from "@app-compose/core"

const userName = tag<string>("userName")

const user = createTask({
  name: "user",
  run: { fn: () => ({ name: "John" }) },
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

// oxfmt-ignore
const userNameShape = shape(
  optional(user.result.name), // 👈
  (name) => name ?? "<unknown-user>"
)

const userNameWire = createWire({
  from: userNameShape,
  to: userName,
})

// oxfmt-ignore
compose()
  // 👇 comment — greeting → "<unknown-user>"
  .step(user)
  .step(userNameWire)
  .step(greeting)
  .run()
