import { type TSESTree as Node, AST_NODE_TYPES as NodeType, type TSESLint } from "@typescript-eslint/utils"
import { isPlainProp, isSpread } from "@/shared/ast"
import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"

// Canonical key order, flat: every option, top-level groups and their nested keys, in one list. A
// `run`/`enabled` ranks at its group slot when opaque (shorthand, variable, …) and at its leaf slots
// when inline; a config holds one form or the other, so the two never collide.
const ORDER = ["name", "run", "run.context", "run.fn", "enabled", "enabled.context", "enabled.fn"]
const rankOf = (key: string) => {
  const index = ORDER.indexOf(key)
  return index === -1 ? Infinity : index
}
// `run`/`enabled` carry nested keys; `name` does not. An inline group is rebuilt from its leaves, an
// opaque one (shorthand, variable) ranks at its group slot and stays whole.
const hasNested = (key: string) => ORDER.some((entry) => entry.startsWith(`${key}.`))

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME.CORE}]`
const methodSelector = `ImportSpecifier[imported.name=${UNITS.CREATE_TASK}]`

const callSelector = `[callee.type="Identifier"][arguments.length=1]`
// Direct child, not a descendant: matches `createTask({ … })` but not `createTask(factory({ … }))`,
// where the object literal sits inside a nested call's arguments rather than createTask's own.
const argumentSelector = `ObjectExpression.arguments`

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

    // The selector guarantees a single object-literal argument, so `config` is an ObjectExpression.
    type MethodCall = Node.CallExpression & { callee: Node.Identifier; arguments: [Node.ObjectExpression] }

    return {
      [`${importSelector} > ${methodSelector}`]: (node: Node.ImportSpecifier) => void imports.add(node.local.name),

      [`CallExpression${callSelector}:has(> ${argumentSelector})`]: (node: MethodCall) => {
        if (!imports.has(node.callee.name)) return

        const [config] = node.arguments
        // The order is undeterminable when a spread sits between options (it could inject any key) or
        // an exotic entry (computed key, getter, method) hides a name — so we don't report. Unknown
        // plain keys are fine: they just sort to the end.
        if (!isReorderable(config)) return

        const keys = orderKeys(config)
        if (isOrdered(keys)) return

        const data = {
          correctOrder: keys.toSorted((a, b) => rankOf(a) - rankOf(b)).join(" -> "),
          currentOrder: keys.join(" -> "),
        }

        // One pass relocates the real nodes, so shorthand/spread/comments survive. `rebuild` returns
        // null when a nested key would have to cross a spread (position is load-bearing there): we
        // report the violation but leave the fix to a human.
        const fixed = rebuild(config, null, source)
        context.report({
          node: config,
          messageId: "invalidOrder",
          data,
          fix: fixed === null ? undefined : (fixer) => fixer.replaceText(config, fixed),
        })
      },
    }
  },
})

type Element = Node.ObjectExpression["properties"][number]
type Entry = { rank: number; text: string }

// A spread anchors a boundary — keys never cross it — so it only fits at the head or tail of a config.
const isLeadingSpread = (props: Element[], index: number) => props.slice(0, index).every(isSpread)
const isTrailingSpread = (props: Element[], index: number) => props.slice(index + 1).every(isSpread)

// Can we reason about the top-level order? Every entry must be a plain key (known or unknown) or a
// spread anchored at the head/tail. An interior spread or an exotic entry hides where options sit.
const isReorderable = (config: Node.ObjectExpression) =>
  config.properties.every((prop, index, props) =>
    isSpread(prop) ? isLeadingSpread(props, index) || isTrailingSpread(props, index) : isPlainProp(prop),
  )

// The visible dotted keys in source order, for the message and the ordered check. A `run`/`enabled`
// object expands into its nested keys; every other plain key contributes its own; spreads carry none.
const orderKeys = (config: Node.ObjectExpression): string[] =>
  config.properties.flatMap((prop) =>
    !isPlainProp(prop)
      ? []
      : prop.value.type === NodeType.ObjectExpression
        ? prop.value.properties.filter(isPlainProp).map((nested) => `${prop.key.name}.${nested.key.name}`)
        : [prop.key.name],
  )

// Already canonical? A stable sort leaves equal ranks (unknown keys, multiple spreads) in place, so an
// ordered config sorts to itself.
const isOrdered = (keys: string[]) => {
  const sorted = keys.toSorted((a, b) => rankOf(a) - rankOf(b))
  return keys.every((key, index) => key === sorted[index])
}

// Sort rank and source text for one entry, or null when it can't be reordered safely. A spread anchors
// at the head (-Infinity) or tail (Infinity); an unknown key sorts to the end (Infinity); an inline
// `run`/`enabled` is rebuilt recursively (null if its own keys would cross a spread); the rest is
// emitted verbatim, so shorthand and comments survive.
type EntryOfParams = {
  prop: Element
  index: number
  props: Element[]
  group: string | null
  source: Readonly<TSESLint.SourceCode>
}

const entryOf = ({ prop, index, props, group, source }: EntryOfParams): Entry | null => {
  if (isSpread(prop)) {
    if (isTrailingSpread(props, index)) return { rank: Infinity, text: source.getText(prop) }
    if (isLeadingSpread(props, index)) return { rank: -Infinity, text: source.getText(prop) }
    return null
  }
  if (!isPlainProp(prop)) return null

  const key = group === null ? prop.key.name : `${group}.${prop.key.name}`

  if (group === null && hasNested(prop.key.name) && prop.value.type === NodeType.ObjectExpression) {
    const inner = rebuild(prop.value, prop.key.name, source)
    return inner === null ? null : { rank: rankOf(key), text: `${prop.key.name}: ${inner}` }
  }

  return { rank: rankOf(key), text: source.getText(prop) }
}

// Canonical source text for an object literal, or null when an entry can't be reordered safely. The top
// level (group null) prints one entry per line; a nested `run`/`enabled` stays inline.
const rebuild = (
  obj: Node.ObjectExpression,
  group: string | null,
  source: Readonly<TSESLint.SourceCode>,
): string | null => {
  const entries: Entry[] = []
  for (const [index, prop] of obj.properties.entries()) {
    const entry = entryOf({ prop, index, props: obj.properties, group, source })
    if (entry === null) return null
    entries.push(entry)
  }

  const texts = entries.toSorted((a, b) => a.rank - b.rank).map((entry) => entry.text)
  return group === null ? `{\n${texts.join(",\n")}\n}` : `{ ${texts.join(", ")} }`
}
