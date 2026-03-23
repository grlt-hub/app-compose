import type { Runnable } from "@runnable"
import type { ComposeHookMap } from "./observer"

type ComposeMeta = { name?: string; hooks?: Partial<ComposeHookMap> }

type ComposeNodeSeq = { type: "seq"; meta?: ComposeMeta; children: ComposeNode[] }
type ComposeNodeCon = { type: "con"; meta?: ComposeMeta; children: ComposeNode[] }
type ComposeNodeRun = { type: "run"; value: Runnable }

type ComposeNode = ComposeNodeSeq | ComposeNodeCon | ComposeNodeRun
type ComposeInner = ComposeNodeCon | ComposeNodeSeq

type Registry = Map<symbol, unknown>
type ComposableKind = "task" | "binding"

export type { ComposableKind, ComposeInner, ComposeMeta, ComposeNode, Registry }
