import {
  FileTabs,
  SandpackLayout,
  SandpackProvider,
  type SandpackOptions,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react"
import { APP_COMPOSE_JS } from "virtual:app-compose-js"
import { Editor } from "./editor/index"
import { Output } from "./output"
import { sandboxStyle } from "./sandboxStyle"
import { useTheme } from "./useTheme"

type Props = {
  code: string
  template?: SandpackPredefinedTemplate
  files?: Record<string, string>
  visibleFiles?: string[]
  options?: Pick<SandpackOptions, "showConsole" | "editorHeight" | "editorWidthPercentage" | "showConsoleButton"> & {
    layout?: SandpackOptions["layout"] | "tests"
    hideOutput: boolean
    storageKey?: string
  }
}

const SandpackEditor = ({ code: __code, template = "react", options, files = {}, visibleFiles }: Props) => {
  const code = options?.storageKey ? (localStorage.getItem(options.storageKey) ?? __code) : __code

  const theme = useTheme()
  const isTests = options?.layout === "tests"
  const isVue = template === "vue" || template === "vue-ts" || template === "vite-vue" || template === "vite-vue-ts"
  const vueIsTs = template === "vue-ts" || template === "vite-vue-ts"
  const vueMainPath = `/src/main.${vueIsTs ? "ts" : "js"}`
  const fileName = isTests
    ? "index.test.js"
    : isVue
      ? "/src/App.vue"
      : template === "react"
        ? "App.js"
        : template === "react-ts"
          ? "App.tsx"
          : template === "vite-react"
            ? "App.jsx"
            : template === "vite-react-ts"
              ? "App.tsx"
              : template === "vanilla-ts"
                ? "index.ts"
                : "index.js"

  const isVite = template === "vite-react" || template === "vite-react-ts"

  const lines = code.replace(/\r\n/g, "\n").split("\n").length
  const fullEditorHeight = options?.editorHeight ?? lines * 18
  const editorHeight = options?.editorHeight ?? fullEditorHeight
  const editorWidthPercentage = options?.hideOutput ? 100 : (options?.editorWidthPercentage ?? 60)

  return (
    <div className="not-content sandbox">
      <SandpackProvider
        template={template}
        theme={theme}
        files={{
          [fileName]: { code },
          ...files,
          "/sandboxStyle.css": { code: sandboxStyle, hidden: true },
          "/node_modules/@grlt-hub/app-compose/index.cjs": { code: APP_COMPOSE_JS, hidden: true },
          "/node_modules/@grlt-hub/app-compose/package.json": {
            code: JSON.stringify({ name: "@grlt-hub/app-compose", main: "index.cjs" }),
            hidden: true,
          },
          ...(isVite && {
            "/index.html": {
              code: `<!DOCTYPE html><html><body><div id="root"></div><script type="module" src="/entry.js"></script></body></html>`,
              hidden: true,
            },
          }),
          ...(isVue
            ? {
                [vueMainPath]: {
                  code: `
            import { createApp } from "vue";
            import App from "./App.vue";
            import "/sandboxStyle.css";
            import * as AppCompose from "@grlt-hub/app-compose";
            Object.assign(window, AppCompose);
            console.clear();
            createApp(App).mount("#app");
            `,
                  hidden: true,
                },
              }
            : {
                "/entry.js": {
                  code: isTests
                    ? `
            import "./sandboxStyle.css";
            import * as AppCompose from "@grlt-hub/app-compose";
            Object.assign(window, AppCompose);
            `
                    : `
            import "./sandboxStyle.css";
            import * as AppCompose from "@grlt-hub/app-compose";
            Object.assign(window, AppCompose);
            console.clear();
            import("./${fileName}").catch(err => console.error(err.message));
            `,
                },
              }),
        }}
        options={{
          initMode: "user-visible",
          initModeObserverOptions: { rootMargin: "1400px 0px" },
          activeFile: fileName,
          visibleFiles: [fileName, ...(visibleFiles ?? [])],
          recompileMode: "delayed",
        }}
        customSetup={{
          entry: isVue ? vueMainPath : "/entry.js",
          dependencies: {
            ...(isTests && { vitest: "latest" }),
            ...(template === "vite-react" && {
              "nanostores": "1.3.0",
              "@nanostores/react": "1.1.0",
            }),
            ...(template === "vite-vue" && {
              "nanostores": "1.3.0",
              "@nanostores/vue": "1.1.0",
            }),
          },
        }}
      >
        <FileTabs />
        <SandpackLayout style={{ height: editorHeight, display: "flex", overflow: "visible" }}>
          <div style={{ width: `${editorWidthPercentage}%`, height: editorHeight }}>
            <Editor template={template} storageKey={options?.storageKey} />
          </div>
          {!options?.hideOutput && (
            <Output
              layout={options?.layout}
              showConsole={options?.showConsole}
              editorWidthPercentage={editorWidthPercentage}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export default SandpackEditor
