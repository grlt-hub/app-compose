<script setup>
import { useStore } from "@nanostores/vue"

const props = defineProps({ atom: { type: Object, required: true } })
const theme = useStore(props.atom)
const onChange = (e) => props.atom.set(e.target.value)
</script>

<template>
  <select :value="theme" @change="onChange">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</template>
