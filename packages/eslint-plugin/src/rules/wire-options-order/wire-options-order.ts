import { AST_NODE_TYPES as NodeType, type TSESTree as Node } from "@typescript-eslint/utils"
import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME.CORE}]`
const methodSelector = `ImportSpecifier[imported.name=${UNITS.CREATE_WIRE}]`
const callSelector = `[callee.type="Identifier"][arguments.length=1]`
const argumentSelector = `ObjectExpression.arguments`

export default createRule({
  name: "wire-options-order",
  meta: {
    type: "problem",
    docs: {
      description: `Enforce options order for ${UNITS.CREATE_WIRE}`,
    },
    messages: {
      invalidOrder: `Order of options should be \`from -> to\`, but found \`to -> from\`.`,
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
      [`${importSelector} > ${methodSelector}`]: (node: Node.ImportSpecifier) => void imports.add(node.local.name),

      [`CallExpression${callSelector}:has(${argumentSelector})`]: (node: MethodCall) => {
        if (!imports.has(node.callee.name)) return

        const [config] = node.arguments
        if (config.properties.length !== 2) return

        const [first, second] = config.properties
        if (
          first?.type !== NodeType.Property ||
          first.key.type !== NodeType.Identifier ||
          second?.type !== NodeType.Property ||
          second.key.type !== NodeType.Identifier
        )
          return

        if (first.key.name === "from") return

        context.report({
          node: config,
          messageId: "invalidOrder",
          fix: (fixer) =>
            fixer.replaceText(
              config,
              `{\nfrom: ${source.getText(second.value)},\nto: ${source.getText(first.value)}\n}`,
            ),
        })
      },
    }
  },
})
