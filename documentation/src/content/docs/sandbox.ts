// oxfmt-ignore
import {
createWire, compose, tag, createTask, literal, optional, shape
} from "@grlt-hub/app-compose"
import { every, some, whenSome, whenEvery } from "@grlt-hub/app-coda"

const task = createTask({
  name: "task",
  run: {
    fn: () => {
      console.log("Hello, World!")
    },
  },
})

compose().step(task).run()
