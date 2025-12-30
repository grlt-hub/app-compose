import { type TSESTree as Node, AST_NODE_TYPES as NodeType, type TSESLint } from "@typescript-eslint/utils"

import { createRule } from "@shared/create"

export default createRule({
  name: "task-options-order",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce options order for Task",
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

    const PACKAGE_NAME = "@grlt-hub/app-compose"

    const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME}]`
    const methodSelector = `ImportSpecifier[imported.name=createTask]`

    const callSelector = `[callee.type="Identifier"][arguments.length=1]`
    const argumentSelector = `ObjectExpression.arguments`

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
        const current = properties.map((prop) => prop.key.name)

        if (isCorrectOrder(current)) return

        const correctOrder = TRUE_ORDER.filter((item) => current.includes(item))
        const othersOrder = current.filter((item) => !TRUE_ORDER.includes(item))
        const order = [...correctOrder, ...othersOrder]

        const snippets = properties
          .slice()
          .sort((a, b) => order.indexOf(a.key.name) - order.indexOf(b.key.name))
          .map((prop) => source.getText(prop))

        const data = { correctOrder: correctOrder.join(" -> "), currentOrder: current.join(" -> ") }
        context.report({
          node: config,
          messageId: "invalidOrder",
          data,
          fix: (fixer: TSESLint.RuleFixer) => [fixer.replaceText(config, `{ ${snippets.join(", ")} }`)],
        })
      },
    }
  },
})

const TRUE_ORDER = ["name", "run", "enabled"]

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
