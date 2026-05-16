<script setup>
import { useStore } from "@nanostores/vue"

const props = defineProps({ atom: { type: Object, required: true } })
const language = useStore(props.atom)
const onChange = (e) => props.atom.set(e.target.value)
</script>

<template>
  <select :value="language" @change="onChange">
    <option value="en">English</option>
    <option value="zh">中文</option>
    <option value="hi">हिन्दी</option>
    <option value="es">Español</option>
    <option value="fr">Français</option>
  </select>
</template>
