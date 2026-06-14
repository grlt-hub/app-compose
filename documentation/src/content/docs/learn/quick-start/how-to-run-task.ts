import { compose, createTask } from "@app-compose/core"

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/users/1")
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
      return result
    },
  },
})

compose()
  // 👇 define
  .step(fetchUser)
  // 👇 run
  .run()
