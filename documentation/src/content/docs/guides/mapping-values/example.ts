import { bind, compose, createTag, createTask, map } from "@grlt-hub/app-compose"

const featureToggle = createTask({
  name: "featureToggle",
  run: { fn: () => ({ dashboard: true }) },
})

const user = createTask({
  name: "user",
  run: { fn: () => ({ id: 1, name: "Bob" }) },
})

const dashboardConfig = createTag<string>({ name: "dashboardConfig" })

const dashboard = createTask({
  name: "dashboard",
  run: {
    // 👇 map in run
    context: map(dashboardConfig.value, (x) => x.toUpperCase()),
    fn: (ctx) => console.log(`dashboard for: ${ctx}`),
  },
  enabled: {
    // 👇 map in enabled
    context: map(featureToggle.result, (x) => x.dashboard),
    fn: (enabled) => enabled,
  },
})

compose()
  .stage({ steps: [featureToggle, user] })
  .stage({
    steps: [
      bind(
        dashboardConfig,
        // 👇 map in tag binding
        map(user.result, (x) => x.name),
      ),
    ],
  })
  .stage({
    steps: [dashboard],
  })
  .run()
