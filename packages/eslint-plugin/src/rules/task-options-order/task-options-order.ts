import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"
import { type TSESTree as Node, AST_NODE_TYPES as NodeType, type TSESLint } from "@typescript-eslint/utils"

const GROUPS = [
  { key: "name" },
  { key: "run", nested: ["fn", "context"] } as const,
  { key: "enabled", nested: ["fn", "context"] } as const,
]

const TRUE_ORDER = GROUPS.flatMap((group) => (group.nested ? group.nested.map((n) => `${group.key}.${n}`) : group.key))

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME}]`
const methodSelector = `ImportSpecifier[imported.name=${UNITS.CREATE_TASK}]`

const callSelector = `[callee.type="Identifier"][arguments.length=1]`
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

    type MethodCall = Node.CallExpression & { callee: Node.Identifier; arguments: [Node.ObjectExpression] }

    return {
      [`${importSelector} > ${methodSelector}`]: (node: Node.ImportSpecifier) => imports.add(node.local.name),

      [`CallExpression${callSelector}:has(${argumentSelector})`]: (node: MethodCall) => {
        if (!imports.has(node.callee.name)) return

        const [config] = node.arguments

        const hasWeirdProperty = config.properties.some(
          (prop) => prop.type === NodeType.SpreadElement || prop.key.type !== NodeType.Identifier
        )
        if (hasWeirdProperty) return

        const properties = config.properties as (Node.Property & { key: Node.Identifier })[]
        const current = getCurrentKeys(properties)

        if (isCorrectOrder(current.keys)) return

        const correctOrder = TRUE_ORDER.filter((item) => current.keys.includes(item))
        const snippets = buildSnippets({ source, nodes: current.nodes })

        const data = { correctOrder: correctOrder.join(" -> "), currentOrder: current.keys.join(" -> ") }
        context.report({
          node: config,
          messageId: "invalidOrder",
          data,
          fix: (fixer) => [fixer.replaceText(config, `{\n${snippets.join(`,\n`)}\n}`)],
        })
      },
    }
  },
})

const getCurrentKeys = (properties: (Node.Property & { key: Node.Identifier })[]) => {
  const nodes = new Map<string, Node.Property>()

  for (const prop of properties) {
    if (prop.value.type !== NodeType.ObjectExpression) {
      nodes.set(prop.key.name, prop)
      continue
    }

    for (const p of prop.value.properties) {
      if (p.type === NodeType.Property && p.key.type === NodeType.Identifier) {
        const key = `${prop.key.name}.${p.key.name}`
        nodes.set(key, p)
      }
    }
  }

  return { keys: Array.from(nodes.keys()), nodes }
}

const isCorrectOrder = (current: string[]) => {
  let seen = -1

  for (const item of current) {
    const index = TRUE_ORDER.indexOf(item)
    const placement = index === -1 ? Infinity : index
    if (placement <= seen) return false
    seen = placement
  }

  return true
}

type BuildSnippetsParams = {
  nodes: Map<string, Node.Property>
  source: Readonly<TSESLint.SourceCode>
}

const buildSnippets = ({ nodes, source }: BuildSnippetsParams) =>
  GROUPS.map((group) => {
    if (group.nested) {
      const parts = group.nested
        .map((nested) => {
          const node = nodes.get(`${group.key}.${nested}`)
          return node ? `${nested}: ${source.getText(node.value)}` : null
        })
        .filter(Boolean)

      return parts.length ? `${group.key}: { ${parts.join(", ")} }` : null
    }

    const node = nodes.get(group.key)
    return node ? `${group.key}: ${source.getText(node.value)}` : null
  }).filter(Boolean)
