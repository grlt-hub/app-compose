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

const tag = createTag({ name: "fetch-user::enabled" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: () => console.log("[fetch-user]: user fetched"),
  },
  enabled: {
    context: { enabled: tag.value },
    // 👇 Return false to skip this Task
    fn: ({ enabled }) => enabled,
  },
})

compose()
  .stage({ steps: [featureFlags] })
  .stage({ steps: [bind(tag, featureFlags.result.fetchingAllowed)] })
  .stage({ steps: [fetchUser] })
  .run()
