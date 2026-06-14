import { createTask } from "@app-compose/core"
import { h } from "vue"
import { selectedTheme } from "./shared-tags.js"
import ThemeProviderView from "./theme-provider.vue"

const ThemeProvider = createTask({
  name: "ThemeProvider",
  run: {
    context: { $theme: selectedTheme.value },
    fn: (ctx) => {
      const Provider = (_, { slots }) => h(ThemeProviderView, { atom: ctx.$theme }, slots)

      return { ui: { Provider } }
    },
  },
})

export { ThemeProvider }
