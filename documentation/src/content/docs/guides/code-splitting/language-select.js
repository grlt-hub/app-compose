console.log("[language-select] module loaded")

const languageSelectFeature = () => {
  console.log("[language-select] feature ran")
  return ["en", "zh", "hi", "es", "fr"]
}

export { languageSelectFeature }
