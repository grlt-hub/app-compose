import { compose, createTask } from "@app-compose/core"

const featureFlags = createTask({
  name: "feature-flags",
  run: {
    fn: () => {
      // 👇 true = Task runs, false = Task is skipped
      const flags = { logInAllowed: true }
      console.log(JSON.stringify(flags, undefined, 2))

      return flags
    },
  },
})

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => console.log("[log-in]: user logged"),
  },
  enabled: {
    context: featureFlags.result.logInAllowed,
    // 👇 Return false to skip this Task
    fn: (enabled) => enabled,
  },
})

// oxfmt-ignore
compose()
  .step(featureFlags)
  .step(logIn)
  .run()
