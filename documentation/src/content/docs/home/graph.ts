// prettier-ignore
import {
bind,compose,createTag,createTask,optional
} from "@grlt-hub/app-compose"

const tag = createTag({ name: "title" })

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ list: [0], title: "hello" }) },
})

const beta = createTask({
  name: "beta",
  run: {
    context: { title: tag.value },
    fn: (title) => console.log(title),
  },
})

const gamma = createTask({
  name: "gamma",
  run: {
    context: { list: optional(alpha.result.list) },
    fn: (list) => console.log(list),
  },
})

const graph = compose()
  .stage({ steps: [alpha] })
  .stage({ steps: [bind(tag, alpha.result.title)] })
  .stage({ steps: [beta, gamma] })
  .graph()

console.log(JSON.stringify(graph, null, 2))
