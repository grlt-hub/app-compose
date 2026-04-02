// oxfmt-ignore
import {
bind,compose,createTag,createTask,literal,optional
} from "@grlt-hub/app-compose"

const task = createTask({
  name: "task",
  run: {
    fn: () => {
      console.log("Hello, World!")
    },
  },
})

compose()
  .stage({ steps: [task] })
  .run()
