<script setup>
import { useStore } from "@nanostores/vue"

const props = defineProps({
  widgets: { type: Array, required: true },
  languageAtom: { type: Object, required: true },
})

const lang = useStore(props.languageAtom)

const titles = {
  en: "Appearance",
  zh: "外观",
  hi: "रूप",
  es: "Apariencia",
  fr: "Apparence",
}
</script>

<template>
  <section>
    <h1>{{ titles[lang] }}</h1>
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center">
      <component :is="w.Widget" v-for="w in widgets" :key="w.key" />
    </div>
  </section>
</template>
