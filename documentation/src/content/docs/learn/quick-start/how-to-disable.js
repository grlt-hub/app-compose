const featureFlags = createTask({
  name: "feature-flags",
  run: {
    fn: () => {
      // 👇 true = Task runs, false = Task is skipped
      const flags = { fetchUser: true }
      console.log(flags)

      return flags
    },
  },
})

const tag = createTag({ name: "fetch-user::enabled" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: () => console.log("[fetch-user]: user fetched"),
  },
  enabled: {
    // 👇 Return false to skip this Task
    fn: ({ enabled }) => enabled,
    context: { enabled: tag },
  },
})

compose()
  .stage([featureFlags])
  .stage([bind(tag, featureFlags.fetchUser)])
  .stage([fetchUser])
  .run()
