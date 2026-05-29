import { useSandpack, type SandpackPredefinedTemplate } from "@codesandbox/sandpack-react"
import MonacoEditor, { type Monaco } from "@monaco-editor/react"
import { useMemo } from "react"
import { useTheme } from "../useTheme"
import { APP_CODA_DTS, APP_COMPOSE_DTS } from "./compose-types"

const useFileLanguage = (template: SandpackPredefinedTemplate, activeFile: string) =>
  useMemo(() => {
    if (activeFile.endsWith(".vue")) return "html"
    if (activeFile.endsWith(".ts") || activeFile.endsWith(".tsx")) return "typescript"
    if (activeFile.endsWith(".js") || activeFile.endsWith(".jsx")) return "javascript"
    if (activeFile.endsWith(".json")) return "json"
    if (activeFile.endsWith(".css")) return "css"
    switch (template) {
      case "react-ts":
      case "vite-react-ts":
      case "vanilla-ts":
        return "typescript"
      case "react":
      case "vite-react":
      case "vanilla":
        return "javascript"
      default:
        return "plaintext"
    }
  }, [template, activeFile])

const beforeMount = (monaco: Monaco) => {
  const currentOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions()

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...currentOptions,
    jsx: true,
  })

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    APP_COMPOSE_DTS,
    "file:///node_modules/@types/grlt-hub__app-compose/index.d.ts",
  )

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    APP_CODA_DTS,
    "file:///node_modules/@types/grlt-hub__app-coda/index.d.ts",
  )
}

const useEditorTheme = () => {
  const theme = useTheme()

  return useMemo(() => (theme === "dark" ? "vs-dark" : "vs"), [theme])
}

const options = {
  minimap: { enabled: false },
  lineNumbers: "on",
  renderValidationDecorations: "on",
  stickyScroll: { enabled: false },
} as const

type Props = {
  template: SandpackPredefinedTemplate
}

const Editor = (props: Props) => {
  const { sandpack } = useSandpack()
  const activeFile = sandpack.activeFile
  const activeCode = sandpack.files[activeFile].code
  const language = useFileLanguage(props.template, activeFile)
  const theme = useEditorTheme()
  const onChange = (code: string | undefined) => {
    sandpack.updateFile(activeFile, code ?? "", true)
  }

  return (
    <MonacoEditor
      language={language}
      theme={theme}
      value={activeCode}
      onChange={onChange}
      beforeMount={beforeMount}
      options={options}
    />
  )
}

export { Editor }
