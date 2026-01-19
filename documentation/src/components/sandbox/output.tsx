import { SandpackConsole, SandpackPreview, SandpackStack, type SandpackOptions } from "@codesandbox/sandpack-react"

type Props = Pick<SandpackOptions, "layout" | "showConsole"> & {
  editorWidthPercentage: number
}

const Output = (props: Props) => {
  const width = `${100 - props.editorWidthPercentage - 0.2}%`

  if (props.layout === "console") {
    return (
      <SandpackStack style={{ height: "100%", width }}>
        <SandpackPreview
          showRefreshButton={false}
          showSandpackErrorOverlay
          // otherwise the console doesn’t update when files change.
          style={{ height: "0%" }}
        />
        <SandpackConsole style={{ height: "100%" }} showHeader showSyntaxError />
      </SandpackStack>
    )
  }

  return (
    <SandpackStack style={{ height: "100%", width }}>
      <SandpackPreview showRefreshButton showSandpackErrorOverlay style={{ height: "100%" }} />
      {props.showConsole && <SandpackConsole style={{ height: "100%" }} showHeader showSyntaxError />}
    </SandpackStack>
  )
}

export { Output }
