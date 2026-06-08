import { type TSESTree as Node, AST_NODE_TYPES as NodeType, type TSESLint } from "@typescript-eslint/utils"
import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"

const GROUPS = [
  { key: "name" },
  { key: "run", nested: ["context", "fn"] } as const,
  { key: "enabled", nested: ["context", "fn"] } as const,
]

// Canonical rank of every key — top-level groups and their nested keys. A `run`/`enabled` that is
// opaque (shorthand, variable, …) ranks at its group position; an inline one ranks at the leaf level.
// A config holds one or the other, never both, so the two never collide.
const RANK = new Map<string, number>()
GROUPS.forEach((group, groupIndex) => {
  RANK.set(group.key, groupIndex * 10)
  group.nested?.forEach((nested, nestedIndex) => RANK.set(`${group.key}.${nested}`, groupIndex * 10 + nestedIndex + 1))
})
const rankOf = (key: string) => RANK.get(key) ?? Infinity

const TOP_KEYS = new Set<string>(GROUPS.map((group) => group.key))
const NESTED_KEYS = new Set<string>(GROUPS.flatMap((group) => group.nested ?? []))
const NESTED_ORDER = GROUPS.find((group) => group.nested)?.nested ?? []

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME.CORE}]`
const methodSelector = `ImportSpecifier[imported.name=${UNITS.CREATE_TASK}]`

const callSelector = `[callee.type="Identifier"][arguments.length=1]`

export default createRule({
  name: "task-options-order",
  meta: {
    type: "problem",
    docs: {
      description: `Enforce options order for ${UNITS.CREATE_TASK}`,
    },
    messages: {
      invalidOrder: `Order of options should be \`{{ correctOrder }}\`, but found \`{{ currentOrder }}\`.`,
    },
    schema: [],
    hasSuggestions: false,
    fixable: "code",
  },
  defaultOptions: [],
  create: (context) => {
    const source = context.sourceCode
    const imports = new Set<string>()

    type MethodCall = Node.CallExpression & { callee: Node.Identifier; arguments: [Node.CallExpressionArgument] }

    return {
      [`${importSelector} > ${methodSelector}`]: (node: Node.ImportSpecifier) => void imports.add(node.local.name),

      [`CallExpression${callSelector}`]: (node: MethodCall) => {
        if (!imports.has(node.callee.name)) return

        const [config] = node.arguments
        // Bail only when the order is genuinely undeterminable (non-object arg, or a top-level spread /
        // computed / getter / unknown key — anything that hides where the real options sit).
        if (config.type !== NodeType.ObjectExpression || !hasKnownShape(config)) return

        const keys = currentKeys(config.properties as TopProperty[])
        if (isCorrectOrder(keys)) return

        const correctOrder = [...keys].sort((a, b) => rankOf(a) - rankOf(b)).join(" -> ")
        const data = { correctOrder, currentOrder: keys.join(" -> ") }

        // Reorder by relocating the real property nodes, so shorthand/spread/comments survive. Attach the
        // fix only when it fully resolves the violation; if a nested key would have to move across a spread
        // (where position is semantically load-bearing), report it but leave the code for a human.
        if (isFullyFixable(config)) {
          context.report({
            node: config,
            messageId: "invalidOrder",
            data,
            fix: (fixer) => [fixer.replaceText(config, reorder(config, source))],
          })
          return
        }

        context.report({ node: config, messageId: "invalidOrder", data })
      },
    }
  },
})

type TopProperty = Node.Property & { key: Node.Identifier }

// A plain `key: value` (or shorthand) property — the only shape we relocate/rebuild by name.
// Spreads, getters/setters, methods and computed keys are not plain props.
const isPlainProp = (prop: Node.ObjectLiteralElement): prop is Node.Property & { key: Node.Identifier } =>
  prop.type === NodeType.Property &&
  prop.kind === "init" &&
  !prop.method &&
  !prop.computed &&
  prop.key.type === NodeType.Identifier

// The order is determinable when every top-level entry is a plain, known key. A spread / computed /
// getter / unknown key hides where the real options sit, so we can't reason about order at all.
const hasKnownShape = (config: Node.ObjectExpression) =>
  config.properties.every((prop) => isPlainProp(prop) && TOP_KEYS.has(prop.key.name))

const isRunGroup = (name: string) => name === "run" || name === "enabled"

// A `run`/`enabled` object we can rebuild key-by-key: only plain, known nested keys (no spread/unknown).
const isReconstructable = (obj: Node.ObjectExpression) =>
  obj.properties.every((p) => isPlainProp(p) && NESTED_KEYS.has(p.key.name))

// Are the visible nested keys already in canonical order? (Used for objects we can't rebuild.)
const isNestedOrdered = (group: string, obj: Node.ObjectExpression) => {
  let seen = -1
  for (const p of obj.properties) {
    if (!isPlainProp(p) || !NESTED_KEYS.has(p.key.name)) continue
    const placement = rankOf(`${group}.${p.key.name}`)
    if (placement <= seen) return false
    seen = placement
  }
  return true
}

// Top-level is always relocatable here (hasKnownShape ⇒ no top-level spread). The only blocker is a
// `run`/`enabled` we must emit verbatim (it holds a spread/unknown nested key) whose own nested keys are
// out of order — we can't reorder across a spread, so that violation can't be fixed without changing
// semantics. In that case we report without a fix rather than apply a non-converging partial fix.
const isFullyFixable = (config: Node.ObjectExpression) =>
  config.properties.every((prop) => {
    if (!isPlainProp(prop) || !isRunGroup(prop.key.name) || prop.value.type !== NodeType.ObjectExpression) return true
    return isReconstructable(prop.value) || isNestedOrdered(prop.key.name, prop.value)
  })

const currentKeys = (properties: TopProperty[]) => {
  const keys = new Map<string, true>()

  for (const prop of properties) {
    if (prop.value.type !== NodeType.ObjectExpression) {
      keys.set(prop.key.name, true)
      continue
    }

    for (const p of prop.value.properties) {
      if (isPlainProp(p)) keys.set(`${prop.key.name}.${p.key.name}`, true)
    }
  }

  return [...keys.keys()]
}

const isCorrectOrder = (current: string[]) => {
  let seen = -1

  for (const item of current) {
    const placement = rankOf(item)
    if (placement <= seen) return false
    seen = placement
  }

  return true
}

// Text for one top-level property in the reordered config: a rebuildable `run`/`enabled` is normalized
// into canonical nested order; everything else (name, shorthand, spread-holding objects) is emitted
// verbatim so nothing is lost.
const propText = (prop: TopProperty, source: Readonly<TSESLint.SourceCode>) => {
  if (isRunGroup(prop.key.name) && prop.value.type === NodeType.ObjectExpression && isReconstructable(prop.value)) {
    const obj = prop.value
    const parts = NESTED_ORDER.flatMap((nested) => {
      const node = obj.properties.find((p): p is TopProperty => isPlainProp(p) && p.key.name === nested)
      return node ? [`${nested}: ${source.getText(node.value)}`] : []
    })
    if (parts.length) return `${prop.key.name}: { ${parts.join(", ")} }`
  }

  return source.getText(prop)
}

const reorder = (config: Node.ObjectExpression, source: Readonly<TSESLint.SourceCode>) => {
  const properties = config.properties as TopProperty[]
  const ordered = [...properties].sort((a, b) => rankOf(a.key.name) - rankOf(b.key.name))

  return `{\n${ordered.map((prop) => propText(prop, source)).join(",\n")}\n}`
}
