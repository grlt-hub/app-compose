// oxfmt-ignore
import { createTask, createWire, compose, tag } from "@grlt-hub/app-compose"

// where the name to greet will live
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
  // filled by the user task
  .step(createWire({ from: user.result.name, to: whoToGreet }))
  .step(greeting)
  .run()
