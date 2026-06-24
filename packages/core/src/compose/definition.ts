import type { Runnable, Task, Wire } from "@runnable"
import type { ComposeObserver } from "./observer"

type ComposeMeta = { name?: string; observe?: ComposeObserver }

type ComposeNodeSeq = { type: "seq"; meta?: ComposeMeta; children: ComposeNode[] }
type ComposeNodeCon = { type: "con"; meta?: ComposeMeta; children: ComposeNode[] }
type ComposeNodeRun = { type: "run"; value: Runnable }

type ComposeNode = ComposeNodeSeq | ComposeNodeCon | ComposeNodeRun
type ComposeInner = ComposeNodeCon | ComposeNodeSeq

type Registry = Map<symbol, unknown>
type ComposableKind = "task" | "wire"

type KnownRunnable = Record<ComposableKind, Runnable> & { task: Task<unknown>; wire: Wire }

export type { ComposableKind, ComposeInner, ComposeMeta, ComposeNode, KnownRunnable, Registry }
