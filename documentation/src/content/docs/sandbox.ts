import { every, some, not, when, debug } from "@app-compose/coda"
import { createWire, compose, tag, createTask, literal, optional, shape } from "@app-compose/core"

const whoToGreet = tag<string>("whoToGreet")

const greeting = createTask({
  name: "greeting",
  run: {
    // greeting reads from it
    context: whoToGreet.value,
    fn: (name) => console.log(`Hello, ${name}!`),
  },
})

const user = createTask({
  name: "user",
  run: { fn: () => ({ name: "World" }) },
})

compose()
  .step(user)
  .step(createWire({ from: user.result.name, to: whoToGreet }))
  .step(greeting)
  .run()
