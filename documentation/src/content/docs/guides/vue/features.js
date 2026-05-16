import { createTask } from "@grlt-hub/app-compose"
import { atom } from "nanostores"
import { h } from "vue"
import LanguageSelectView from "./language-select.vue"
import ThemeSelectView from "./theme-select.vue"

const ThemeSelect = createTask({
  name: "ThemeSelect",
  run: {
    fn: () => {
      const $theme = atom("light")
      const Widget = () => h(ThemeSelectView, { atom: $theme })

      return {
        ui: { Widget },
        api: { $theme },
      }
    },
  },
})

const LanguageSelect = createTask({
  name: "LanguageSelect",
  run: {
    fn: () => {
      const $language = atom("en")
      const Widget = () => h(LanguageSelectView, { atom: $language })

      return {
        ui: { Widget },
        api: { $language },
      }
    },
  },
})

export { LanguageSelect, ThemeSelect }
