import { status } from "@grlt-hub/app-compose"

const mainFeature = createTask({
  name: "main",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("Oops!")
    },
  },
  enabled: { fn: () => true },
})

const dependentFeature = createTask({
  name: "dependent",
  run: { fn: () => {} },
  enabled: {
    fn: ({ mainFeatureEnabled }) => mainFeatureEnabled,
    context: { mainFeatureEnabled: status(mainFeature, "done") },
  },
})

const render = createTask({
  name: "render",
  run: {
    fn: (status) => {
      document.body.innerText = `[main]: ${status.main.name}
      [dependent]: ${status.dependent.name}`
    },
    context: {
      main: status(mainFeature),
      dependent: status(dependentFeature),
    },
  },
})

compose().stage([mainFeature], [dependentFeature]).stage([render]).run()
