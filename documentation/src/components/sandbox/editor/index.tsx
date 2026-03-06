import { useSandpack, type SandpackPredefinedTemplate } from "@codesandbox/sandpack-react"
import MonacoEditor, { type Monaco } from "@monaco-editor/react"
import { useMemo } from "react"
import { useTheme } from "../useTheme"
import { APP_COMPOSE_DTS } from "./compose-types"

const useFileLanguage = (template: SandpackPredefinedTemplate) =>
  useMemo(() => {
    switch (template) {
      case "react-ts":
      case "vanilla-ts":
        return "typescript"
      case "react":
      case "vanilla":
        return "javascript"
      default:
        return "plaintext"
    }
  }, [template])

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
  storageKey?: string
}

const Editor = (props: Props) => {
  const { sandpack } = useSandpack()
  const activeFile = sandpack.activeFile
  const activeCode = sandpack.files[activeFile].code
  const language = useFileLanguage(props.template)
  const theme = useEditorTheme()
  const onChange = (code: string | undefined) => {
    sandpack.updateFile(activeFile, code ?? "", true)
    if (props.storageKey) localStorage.setItem(props.storageKey, code ?? "")
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
