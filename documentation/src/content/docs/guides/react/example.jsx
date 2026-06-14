import { compose, createTask, createWire, literal } from "@app-compose/core"
import { createRoot } from "react-dom/client"
import { Appearance, appearanceWidgets } from "./appearance"
import { LanguageSelect, ThemeSelect } from "./features"
import { selectedTheme, selectedLanguage } from "./shared-tags"
import { ThemeProvider } from "./theme-provider"

// page-level — reads Tasks directly
const renderApp = createTask({
  name: "render-app",
  run: {
    context: {
      AppearanceLayout: Appearance.result.ui.Layout,
      ThemeProvider: ThemeProvider.result.ui.Provider,
    },
    fn: (ctx) => {
      const root = createRoot(document.getElementById("root"))
      root.render(
        <ctx.ThemeProvider>
          <ctx.AppearanceLayout />
        </ctx.ThemeProvider>,
      )
    },
  },
})

compose()
  .step([ThemeSelect, LanguageSelect])
  // fill features data into shared tags
  .step([
    createWire({
      from: {
        theme: ThemeSelect.result.api.$theme,
        language: LanguageSelect.result.api.$language,
      },
      to: { theme: selectedTheme, language: selectedLanguage },
    }),
  ])
  // collect feature widgets into one tag
  .step(
    createWire({
      from: [
        {
          Widget: ThemeSelect.result.ui.Widget,
          key: literal(ThemeSelect.name),
        },
        {
          Widget: LanguageSelect.result.ui.Widget,
          key: literal(LanguageSelect.name),
        },
      ],
      to: appearanceWidgets,
    }),
  )
  .step([Appearance, ThemeProvider])
  .step(renderApp)
  .run()
