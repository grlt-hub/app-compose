import { createTask, tag } from "@grlt-hub/app-compose"
import { useStore } from "@nanostores/react"
import { selectedLanguage } from "./shared-tags"

const titles = {
  en: "Appearance",
  zh: "外观",
  hi: "रूप",
  es: "Apariencia",
  fr: "Apparence",
}

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
      const Layout = () => {
        const lang = useStore(ctx.$selectedLanguage)

        return (
          <section>
            <h1>{titles[lang]}</h1>
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

export { appearanceWidgets, Appearance }
