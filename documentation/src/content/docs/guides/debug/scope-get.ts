import { compose, createTask, createWire, tag } from "@app-compose/core"

const userId = tag<number>("userId")

const fetchUser = createTask({
  name: "fetch-user",
  run: { fn: () => ({ id: 1 }) },
})

const loadCart = createTask({
  name: "load-cart",
  run: {
    context: userId.value,
    fn: () => {
      throw new Error("cart service is down")
    },
  },
})

;(async () => {
  const scope = await compose()
    .step(fetchUser)
    .step(createWire({ from: fetchUser.result.id, to: userId }))
    .step(loadCart)
    .run()

  console.log(`[fetchUser.status]: ${scope.get(fetchUser.status)}`)
  console.log(`[fetchUser.result]: ${JSON.stringify(scope.get(fetchUser.result))}`)
  console.log(`[userId]: ${scope.get(userId.value)}`)
  console.log(`[loadCart.status]: ${scope.get(loadCart.status)}`)
  console.log(`[loadCart.error]: ${scope.get(loadCart.error)}`)
})()
