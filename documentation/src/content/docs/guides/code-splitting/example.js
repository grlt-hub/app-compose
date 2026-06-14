import { compose, createTask } from "@app-compose/core"
import { themeSelectFeature } from "./theme-select"

const themeSelect = createTask({
  name: "theme-select",
  run: { fn: () => themeSelectFeature() },
  // Task is disabled — but the static import above already loaded the module
  enabled: { fn: () => false },
})

const languageSelect = createTask({
  name: "language-select",
  run: {
    fn: async () => {
      const { languageSelectFeature } = await import("./language-select")
      languageSelectFeature()
    },
  },
  // Task is disabled — the dynamic import never runs, so the module never loads
  enabled: { fn: () => false },
  // 👇 uncomment to enable — the module will load
  // enabled: { fn: () => true },
})

compose().step([themeSelect, languageSelect]).run()
