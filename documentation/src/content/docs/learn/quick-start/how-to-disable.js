const featureFlags = createTask({
  name: "feature-flags",
  run: {
    fn: () => {
      // 👇 true = Task runs, false = Task is skipped
      const flags = { fetchingAllowed: true }
      console.log(flags)

      return flags
    },
  },
})

const enabledTag = tag("fetch-user::enabled")

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: () => console.log("[fetch-user]: user fetched"),
  },
  enabled: {
    context: { enabled: enabledTag.value },
    // 👇 Return false to skip this Task
    fn: ({ enabled }) => enabled,
  },
})

compose()
  .step(featureFlags)
  .step(createWire({ to: tag, from: featureFlags.result.fetchingAllowed }))
  .step(fetchUser)
  .run()
