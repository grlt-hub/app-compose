<script setup>
import { useStore } from "@nanostores/vue"
import { onScopeDispose, watchEffect } from "vue"

const props = defineProps({ atom: { type: Object, required: true } })
const theme = useStore(props.atom)

watchEffect(() => {
  const dark = theme.value === "dark"
  document.body.style.background = dark ? "#222" : "#fff"
  document.body.style.color = dark ? "#eee" : "#111"
})

onScopeDispose(() => {
  document.body.style.background = ""
  document.body.style.color = ""
})
</script>

<template>
  <slot />
</template>
