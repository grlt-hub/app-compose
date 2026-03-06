// prettier-ignore
import {
bind,compose,createTag,createTask,literal,
} from "@grlt-hub/app-compose"

const tag = createTag<string>({ name: "myFirstTag" })

const task = createTask({
  name: "page",
  run: {
    context: { title: tag.value },
    fn: (ctx) => {
      document.body.innerHTML = `<h1>${ctx.title}</h1>`
    },
  },
})

const title = "Welcome to my app"

compose()
  .stage({ steps: [bind(tag, literal(title))] })
  .stage({ steps: [task] })
  .run()
