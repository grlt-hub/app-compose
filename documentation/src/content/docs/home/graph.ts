// oxfmt-ignore
import {
createWire, compose, tag, createTask, optional
} from "@grlt-hub/app-compose"

const title = tag<string>("title")

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ list: [0], title: "hello" }) },
})

const beta = createTask({
  name: "beta",
  run: {
    context: { title: title.value },
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
  .step(alpha)
  .step(createWire({ from: alpha.result.title, to: title }))
  .step([beta, gamma])
  // 👇 use .graph() instead of .run() to get the dependency graph
  .graph()

console.log(JSON.stringify(graph, null, 2))
