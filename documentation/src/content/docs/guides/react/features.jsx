import { createTask } from "@grlt-hub/app-compose"
import { atom } from "nanostores"

const ThemeSelect = createTask({
  name: "ThemeSelect",
  run: {
    fn: () => {
      const $theme = atom("light")

      const onChange = (e) => $theme.set(e.target.value)

      const Widget = () => (
        <select name="theme" defaultValue={$theme.value} onChange={onChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      )

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
      const onChange = (e) => $language.set(e.target.value)

      const Widget = () => (
        <select name="language" defaultValue={$language.value} onChange={onChange}>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="hi">हिन्दी</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      )

      return {
        ui: { Widget },
        api: { $language },
      }
    },
  },
})

export { LanguageSelect, ThemeSelect }
