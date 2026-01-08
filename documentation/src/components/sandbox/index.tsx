import { Sandpack, type SandpackOptions, type SandpackPredefinedTemplate } from "@codesandbox/sandpack-react"
import { sandboxStyle } from "./sandboxStyle"
import { useTheme } from "./useTheme"

type Props = {
  code: string
  template?: SandpackPredefinedTemplate
  files?: Record<string, string>
  options?: Pick<
    SandpackOptions,
    "showConsole" | "layout" | "editorHeight" | "editorWidthPercentage" | "showConsoleButton"
  >
}

const SandpackEditor = ({ code, template = "react", options, files = {} }: Props) => {
  const theme = useTheme()
  const fileName = template === "react" ? "App.js" : template === "react-ts" ? "App.tsx" : "index.js"

  return (
    <div className="not-content">
      <Sandpack
        template={template}
        theme={theme}
        files={{
          [fileName]: { code },
          ...files,
          "/sandboxStyle.css": { code: sandboxStyle },
          "/entry.js": {
            code: `
            import "./sandboxStyle.css";
            import * as AppCompose from "@grlt-hub/app-compose";
            Object.assign(window, AppCompose);
            import("./${fileName}");
            `,
          },
        }}
        options={{
          editorHeight: options?.editorHeight,
          showConsole: options?.showConsole,
          layout: options?.layout,
          editorWidthPercentage: options?.editorWidthPercentage ?? 60,

          showNavigator: false,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          resizablePanels: true,
          showConsoleButton: options?.showConsoleButton ?? true,
          initMode: "user-visible",
          initModeObserverOptions: { rootMargin: "1400px 0px" },
          // @ts-expect-error idk
          visibleFiles: [fileName],
        }}
        customSetup={{
          dependencies: {
            "@grlt-hub/app-compose": "3.0.0-alpha.7",
          },
          entry: "/entry.js",
        }}
      />
    </div>
  )
}

export default SandpackEditor
