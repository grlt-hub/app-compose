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

// always "done"
const sendAnalytics = createTask({
  name: "send-analytics",
  run: { fn: () => {} },
})

compose()
  .step(logIn)
  .step(createWire({ from: logIn.result.userId, to: userId }))
  .step([fetchUser, loadCart, sendAnalytics])
  .run()
  .then((scope) => {
    console.log(`logIn status: ${scope.get(logIn.status)}`)
    console.log(`fetchUser status: ${scope.get(fetchUser.status)}`)
    console.log(`loadCart status: ${scope.get(loadCart.status)}`)
    console.log(`sendAnalytics status: ${scope.get(sendAnalytics.status)}`)
  })
