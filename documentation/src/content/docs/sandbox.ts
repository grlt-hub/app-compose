// prettier-ignore
import {
  bind, compose, createTag, createTask, literal, optional, status
} from "@grlt-hub/app-compose"

const task = createTask({
  name: "task",
  run: {
    fn: () => {
      console.log("Hello, World!")
    },
  },
})

compose().stage([task]).run()
