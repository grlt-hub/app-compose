import { compose, createTask } from "@grlt-hub/app-compose"

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

compose().stage([fetchUser]).run()
