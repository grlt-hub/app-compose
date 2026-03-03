import { map } from "@grlt-hub/app-compose"

const mainFeature = createTask({
  name: "main",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("Oops!")
    },
  },
  // 👇 true = Task runs, false = Task is skipped
  enabled: { fn: () => true },
})

const dependentFeature = createTask({
  name: "dependent",
  run: { fn: () => {} },
  enabled: {
    context: { mainFeatureEnabled: map(mainFeature.status, (v) => v === "done") },
    fn: ({ mainFeatureEnabled }) => mainFeatureEnabled,
  },
})

const render = createTask({
  name: "render",
  run: {
    fn: (status) => {
      document.body.innerText = `[main]: ${status.main}
      [dependent]: ${status.dependent}`
    },
    context: {
      main: mainFeature.status,
      dependent: dependentFeature.status,
    },
  },
})

compose()
  .stage({ steps: [mainFeature] }, { steps: [dependentFeature] })
  .stage({ steps: [render] })
  .run()
