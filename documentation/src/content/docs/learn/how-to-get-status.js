import { status } from "@grlt-hub/app-compose"

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("[log-in]: failed")
    },
  },
})

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("[fetch-user]: failed")
    },
  },
})

const controlTask = createTask({
  name: "control",
  run: {
    fn: ({ checks }) => {
      const failure = checks.some(Boolean)

      if (failure) {
        console.log("Something went wrong. Please try again.")
      } else {
        console.log("Everything is working!")
      }
    },
    context: {
      checks: [status(logIn, "fail"), status(fetchUser, "fail")],
    },
  },
})

compose().stage([logIn], [fetchUser]).stage([controlTask]).run()
