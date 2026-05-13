import { compose, createTask, optional } from "@grlt-hub/app-compose"

const user = createTask({
  name: "user",
  run: {
    fn: () => ({ name: "John" }),
  },
})

const location = createTask({
  name: "location",
  run: { fn: () => "Antarctica" },
})

const greeting = createTask({
  name: "greeting",
  run: {
    context: { user: optional(user.result) }, // 👈
    fn: ({ user }) => {
      console.log(`Hello, ${user?.name ?? "<unknown-user>"}`)
    },
  },
})

const recommendations = createTask({
  name: "recommendations",
  run: {
    fn: () => console.log("recommendations loaded"),
  },
  enabled: {
    context: [
      optional(user.result), // 👈
      optional(location.result), // 👈
    ],
    fn: (ctx) => ctx.some((x) => x !== undefined),
  },
})

// Try commenting a step:
//   .step(user)      → "<unknown-user>", recommendations run
//   .step(location)  → "Hello, John", recommendations run
//   both             → "<unknown-user>", recommendations skip
// oxfmt-ignore
compose()
  .step(user)
  .step(greeting)
  .step(location)
  .step(recommendations)
  .run()
