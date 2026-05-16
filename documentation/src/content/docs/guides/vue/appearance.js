import { createTask, tag } from "@grlt-hub/app-compose"
import { h } from "vue"
import AppearanceView from "./appearance.vue"
import { selectedLanguage } from "./shared-tags.js"

// tag: { Widget, key }[]
const appearanceWidgets = tag("appearanceWidgets")

const Appearance = createTask({
  name: "Appearance",
  run: {
    context: {
      widgets: appearanceWidgets.value,
      $selectedLanguage: selectedLanguage.value,
    },
    fn: (ctx) => {
      const Layout = () =>
        h(AppearanceView, {
          widgets: ctx.widgets,
          languageAtom: ctx.$selectedLanguage,
        })

      return { ui: { Layout } }
    },
  },
})

export { Appearance, appearanceWidgets }
