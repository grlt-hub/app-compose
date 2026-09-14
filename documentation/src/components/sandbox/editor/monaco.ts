import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor/editor"
import "monaco-editor/features/bracketMatching/register"
import "monaco-editor/features/clipboard/register"
import "monaco-editor/features/codeAction/register"
import "monaco-editor/features/comment/register"
import "monaco-editor/features/contextmenu/register"
import "monaco-editor/features/find/register"
import "monaco-editor/features/folding/register"
import "monaco-editor/features/format/register"
import "monaco-editor/features/gotoError/register"
import "monaco-editor/features/gotoSymbol/register"
import "monaco-editor/features/hover/register"
import "monaco-editor/features/indentation/register"
import "monaco-editor/features/linesOperations/register"
import "monaco-editor/features/multicursor/register"
import "monaco-editor/features/parameterHints/register"
import "monaco-editor/features/rename/register"
import "monaco-editor/features/snippet/register"
import "monaco-editor/features/suggest/register"
import "monaco-editor/features/tokenization/register"
import "monaco-editor/features/wordHighlighter/register"
import "monaco-editor/languages/definitions/css/register"
import "monaco-editor/languages/definitions/html/register"
import "monaco-editor/languages/definitions/javascript/register"
import "monaco-editor/languages/definitions/typescript/register"
import "monaco-editor/languages/features/css/register"
import "monaco-editor/languages/features/html/register"
import "monaco-editor/languages/features/json/register"
import EditorWorker from "monaco-editor/editor/editor.worker?worker"
import CssWorker from "monaco-editor/language/css/css.worker?worker"
import HtmlWorker from "monaco-editor/language/html/html.worker?worker"
import JsonWorker from "monaco-editor/language/json/json.worker?worker"
import TypeScriptWorker from "monaco-editor/language/typescript/ts.worker?worker"

self.MonacoEnvironment = {
  getWorker(_, language) {
    switch (language) {
      case "json":
        return new JsonWorker()
      case "css":
        return new CssWorker()
      case "html":
        return new HtmlWorker()
      case "typescript":
      case "javascript":
        return new TypeScriptWorker()
      default:
        return new EditorWorker()
    }
  },
}

loader.config({ monaco })
