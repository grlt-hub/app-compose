import { compose, createTask, shape } from "@grlt-hub/app-compose"

const firstName = createTask({
  name: "first-name",
  run: { fn: () => "John" },
})

const lastName = createTask({
  name: "last-name",
  run: { fn: () => "Doe" },
})

const fullNameShape = shape(
  {
    first: firstName.result,
    last: lastName.result,
  },
  (v) => `${v.first} ${v.last}`,
)

// as an array
// shape(
//   [firstName.result, lastName.result],
//   ([first, last]) => `${first} ${last}`,
// )

const fullName = createTask({
  name: "full-name",
  run: {
    context: { fullName: fullNameShape },
    fn: console.log,
  },
})

// oxfmt-ignore
compose()
  .step([firstName, lastName])
  .step(fullName)
  .run()
