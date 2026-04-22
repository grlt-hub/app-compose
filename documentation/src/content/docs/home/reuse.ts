// oxfmt-ignore
import {
createWire, compose, tag, createTask, literal
} from "@grlt-hub/app-compose";

const label = tag<string>("label")

// 👇 same task — different context each time
const greet = createTask({
  name: "greet",
  run: {
    context: label.value,
    fn: (label) => console.log(`Hello, ${label}!`),
  },
})

compose()
  .step(createWire({ from: literal("Alice"), to: label }))
  .step(greet)
  .run()

compose()
  .step(createWire({ from: literal("Bob"), to: label }))
  .step(greet)
  .run()
