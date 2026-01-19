// prettier-ignore
import {
  bind, compose, createTag, createTask, literal
} from "@grlt-hub/app-compose"

type Ctx = {
  title: string
}

const tag = createTag<Ctx["title"]>({ name: "myFirstTag" })

const task = createTask({
  name: "page",
  run: {
    fn: (ctx: Ctx) => {
      document.body.innerHTML = `<h1>${ctx.title}</h1>`
    },
    context: { title: tag },
  },
})

const title = "Welcome to my app"

compose()
  .stage([bind(tag, literal(title))], [task])
  .run()
