// oxfmt-ignore
import {
bind,compose,createTag,createTask,optional
} from "@grlt-hub/app-compose"

const tag = createTag<string>({ name: "title" })

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ list: [0], title: "hello" }) },
})

const beta = createTask({
  name: "beta",
  run: {
    context: { title: tag.value },
    fn: console.log,
  },
})

const gamma = createTask({
  name: "gamma",
  run: {
    context: { list: optional(alpha.result.list) },
    fn: console.log,
  },
})

const graph = compose()
  .stage({ steps: [alpha] })
  .stage({ steps: [bind(tag, alpha.result.title)] })
  .stage({ steps: [beta, gamma] })
  // 👇 use .graph() instead of .run() to get the dependency graph
  .graph()

console.log(JSON.stringify(graph, null, 2))
