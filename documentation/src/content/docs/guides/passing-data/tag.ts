import { bind, compose, createTag, createTask } from "@grlt-hub/app-compose"

const userIdTag = createTag<number>({ name: "userId" })

const auth = createTask({
  name: "auth",
  run: {
    fn: () => {
      // 👇 Simulates a login result
      return { userId: 1 }
    },
  },
})

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    // 👇 fetchUser only knows about the tag — not about auth
    context: { userId: userIdTag.value },
    fn: async ({ userId }) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      const result = await response.json()
      console.log(JSON.stringify(result, null, 2))
    },
  },
})

compose()
  .stage({ steps: [auth] })
  .stage({ steps: [bind(userIdTag, auth.result.userId)] }) // 👈 tag is filled here
  .stage({ steps: [fetchUser] })
  .run()
