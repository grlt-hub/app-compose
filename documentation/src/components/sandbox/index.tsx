import {
  FileTabs,
  SandpackLayout,
  SandpackProvider,
  type SandpackOptions,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react"
import { APP_CODA_JS } from "virtual:app-coda-js"
import { APP_COMPOSE_JS } from "virtual:app-compose-js"
import { useEffect, useState } from "react"
import { Editor } from "./editor/index"
import { Output } from "./output"
import { sandboxStyle } from "./sandboxStyle"
import { ShareButton, fetchSharedCode, readShareId, stripShareParam } from "./share"
import { useTheme } from "./useTheme"

type Props = {
  code: string
  template?: SandpackPredefinedTemplate
  files?: Record<string, string>
  visibleFiles?: string[]
  share?: boolean
  options?: Pick<SandpackOptions, "showConsole" | "editorHeight" | "editorWidthPercentage" | "showConsoleButton"> & {
    layout?: SandpackOptions["layout"] | "tests"
    hideOutput: boolean
  }
}

const SandpackEditor = ({ code: defaultCode, template = "react", options, files = {}, visibleFiles, share = false }: Props) => {
  // If the URL carries ?s=<id>, resolve that snippet BEFORE mounting Sandpack and use it as the
  // initial file — so the preview compiles/runs the shared code (editor and console stay in sync).
  const [shareId] = useState(() => (share ? readShareId() : null))
  const [sharedCode, setSharedCode] = useState<string | null>(null)
  const [resolving, setResolving] = useState(Boolean(shareId))

  useEffect(() => {
    if (!shareId) return
    let alive = true
    fetchSharedCode(shareId)
      .then((c) => {
        if (!alive) return
        // On a hit, keep ?s in the URL — ShareButton owns it from here and drops it on the first
        // edit. On a miss the link is dead, so clear it now rather than advertise a broken snippet.
        if (c !== null) setSharedCode(c)
        else stripShareParam()
        setResolving(false)
      })
    return () => {
      alive = false
    }
  }, [shareId])

  const theme = useTheme()

  // hold off mounting until the shared snippet resolves, otherwise the preview runs the default first
  if (resolving) return <div className="not-content sandbox" aria-busy="true" />

  const code = sharedCode ?? defaultCode
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
          "/node_modules/@grlt-hub/app-coda/index.cjs": { code: APP_CODA_JS, hidden: true },
          "/node_modules/@grlt-hub/app-coda/package.json": {
            code: JSON.stringify({ name: "@grlt-hub/app-coda", main: "index.cjs" }),
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
            import * as AppCoda from "@grlt-hub/app-coda";
            Object.assign(window, AppCompose, AppCoda);
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
            import * as AppCoda from "@grlt-hub/app-coda";
            Object.assign(window, AppCompose, AppCoda);
            `
                    : `
            import "./sandboxStyle.css";
            import * as AppCompose from "@grlt-hub/app-compose";
            import * as AppCoda from "@grlt-hub/app-coda";
            Object.assign(window, AppCompose, AppCoda);
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
        {share && <ShareButton />}
        <SandpackLayout style={{ height: editorHeight, display: "flex", overflow: "visible" }}>
          <div style={{ width: `${editorWidthPercentage}%`, height: editorHeight }}>
            <Editor template={template} />
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
