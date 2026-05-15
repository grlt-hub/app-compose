import { createTask, tag } from "@grlt-hub/app-compose"
import { useStore } from "@nanostores/react"
import { selectedLanguage } from "./shared-tags"

// tag: { Widget, key }[]
const settingsWidgets = tag("settingsWidgets")

const titles = {
  en: "Settings",
  zh: "设置",
  hi: "सेटिंग्स",
  es: "Ajustes",
  fr: "Paramètres",
}

const Settings = createTask({
  name: "Settings",
  run: {
    context: {
      widgets: settingsWidgets.value,
      $selectedLanguage: selectedLanguage.value,
    },
    fn: (ctx) => {
      const Layout = () => {
        const lang = useStore(ctx.$selectedLanguage)

        return (
          <section>
            <h1>{titles[lang] ?? titles["en"]}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {ctx.widgets.map(({ Widget, key }) => (
                <Widget key={key} />
              ))}
            </div>
          </section>
        )
      }

      return { ui: { Layout } }
    },
  },
})

export { settingsWidgets, Settings }
