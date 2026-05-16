<script setup>
import { compose, createTask, createWire, literal } from "@grlt-hub/app-compose"
import { createApp, h, onMounted } from "vue"
import { Appearance, appearanceWidgets } from "./appearance.js"
import { LanguageSelect, ThemeSelect } from "./features.js"
import { selectedLanguage, selectedTheme } from "./shared-tags.js"
import { ThemeProvider } from "./theme-provider.js"

// page-level — reads Tasks directly
const renderApp = createTask({
  name: "render-app",
  run: {
    context: {
      AppearanceLayout: Appearance.result.ui.Layout,
      ThemeProvider: ThemeProvider.result.ui.Provider,
    },
    fn: (ctx) => {
      createApp({
        render: () => h(ctx.ThemeProvider, null, () => h(ctx.AppearanceLayout)),
      }).mount("#root")
    },
  },
})

onMounted(() => {
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
          { Widget: ThemeSelect.result.ui.Widget, key: literal(ThemeSelect.name) },
          { Widget: LanguageSelect.result.ui.Widget, key: literal(LanguageSelect.name) },
        ],
        to: appearanceWidgets,
      }),
    )
    .step([Appearance, ThemeProvider])
    .step(renderApp)
    .run()
})
</script>

<template>
  <div id="root"></div>
</template>
