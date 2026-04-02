// oxfmt-ignore
import {
bind,compose,createTag,createTask,literal
} from "@grlt-hub/app-compose";

const label = createTag<string>({ name: "label" })

// 👇 same task — different context each time
const greet = createTask({
  name: "greet",
  run: {
    context: label.value,
    fn: (label) => console.log(`Hello, ${label}!`),
  },
})

compose()
  .stage({ steps: [bind(label, literal("Alice"))] })
  .stage({ steps: [greet] })
  .run()

compose()
  .stage({ steps: [bind(label, literal("Bob"))] })
  .stage({ steps: [greet] })
  .run()
