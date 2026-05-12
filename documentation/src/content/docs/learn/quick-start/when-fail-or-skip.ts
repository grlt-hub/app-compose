import { compose, createTask, createWire, tag } from "@grlt-hub/app-compose"

const userId = tag<number>("userId")

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => {
      // 👇 uncomment to make logIn fail
      // throw new Error("oops")
      return { userId: 1 }
    },
  },
  // 👇 or uncomment to skip logIn instead
  // enabled: { fn: () => false },
})

// reads through a Tag
const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: userId.value,
    fn: () => {},
  },
})

// reads directly
const loadCart = createTask({
  name: "load-cart",
  run: {
    context: logIn.result.userId,
    fn: () => {},
  },
})

// independent — runs no matter what
const sendAnalytics = createTask({
  name: "send-analytics",
  run: { fn: () => {} },
})

// 👇 control-task pattern. More in /guides/
const controlTask = createTask({
  name: "control-task",
  run: {
    context: {
      [logIn.name]: logIn.status,
      [fetchUser.name]: fetchUser.status,
      [loadCart.name]: loadCart.status,
      [sendAnalytics.name]: sendAnalytics.status,
    },
    fn: (ctx) => {
      Object.entries(ctx).forEach(([name, status]) => {
        console.log(`${name} status: ${status}`)
      })
    },
  },
})

compose()
  .step(logIn)
  .step(createWire({ from: logIn.result.userId, to: userId }))
  .step([fetchUser, loadCart, sendAnalytics])
  .step(controlTask)
  .run()
