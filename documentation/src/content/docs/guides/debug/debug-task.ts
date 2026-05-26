import { debug } from "@grlt-hub/app-coda"
import { compose, createTask, createWire, tag } from "@grlt-hub/app-compose"

const userId = tag<number>("userId")

const fetchUser = createTask({
  name: "fetch-user",
  run: { fn: () => ({ id: 1 }) },
})

const loadCart = createTask({
  name: "load-cart",
  run: {
    fn: () => {
      throw new Error("cart service is down")
    },
  },
})

compose()
  .step(fetchUser)
  .step(createWire({ from: fetchUser.result.id, to: userId }))
  // after fetchUser + wire
  .step(debug(fetchUser, userId))
  .step(loadCart)
  // after loadCart
  .step(debug(loadCart))
  .run()

console.warn("This sandbox flattens grouped logs.")
console.warn("In your DevTools console, debug() output is nested and collapsible.")
