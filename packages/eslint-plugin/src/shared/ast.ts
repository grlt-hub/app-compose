import { AST_NODE_TYPES as NodeType, ASTUtils, type TSESTree as Node } from "@typescript-eslint/utils"
import esquery from "esquery"

type KeyedProp = Node.Property & { key: Node.Identifier }

// A plain `key: value` (or shorthand) property — the shape the options-order rules relocate by name.
// Matched with an esquery selector, like the rules' node matches; the `prop is KeyedProp` annotation
// keeps `.filter`/`.find` callers narrowed. Spreads, getters/setters, methods and computed keys miss.
const PLAIN_PROP = esquery.parse(`Property[kind="init"][method=false][computed=false][key.type="Identifier"]`)
const isPlainProp = (prop: Node.ObjectLiteralElement): prop is KeyedProp =>
  esquery.matches(prop as unknown as Parameters<typeof esquery.matches>[0], PLAIN_PROP)

// A spread element (`...rest`) inside an object literal. It carries no key of its own, so it anchors a
// position rather than taking part in key ordering.
const isSpread = ASTUtils.isNodeOfType(NodeType.SpreadElement)

export { isPlainProp, isSpread }
