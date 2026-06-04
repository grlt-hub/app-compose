import { ESLintUtils, type TSESTree as Node } from "@typescript-eslint/utils"
import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME.CORE}]`
const specifierSelector = `ImportSpecifier[imported.name=${UNITS.SHAPE}]`
const callSelector = `[callee.type="Identifier"][arguments.length=2]`

export default createRule({
  name: "no-async-shape-callback",
  meta: {
    type: "problem",
    docs: {
      description: `Disallow async callbacks in \`${UNITS.SHAPE}()\``,
    },
    messages: {
      asyncCallback: `Unexpected async callback in \`${UNITS.SHAPE}()\` — async work runs outside the chain, and App-Compose cannot order it.`,
    },
    schema: [],
    hasSuggestions: false,
  },
  defaultOptions: [],
  create: (context) => {
    const services = ESLintUtils.getParserServices(context)
    const imports = new Set<string>()

    type ShapeCall = Node.CallExpression & {
      callee: Node.Identifier
      arguments: [Node.CallExpressionArgument, Node.CallExpressionArgument]
    }

    return {
      [`${importSelector} > ${specifierSelector}`]: (node: Node.ImportSpecifier) => imports.add(node.local.name),

      [`CallExpression${callSelector}`]: (node: ShapeCall) => {
        if (!imports.has(node.callee.name)) return

        const [, fn] = node.arguments
        const returnsPromise = services
          .getTypeAtLocation(fn)
          .getCallSignatures()
          .some((signature) => signature.getReturnType().getSymbol()?.name === "Promise")

        if (!returnsPromise) return

        context.report({ node: fn, messageId: "asyncCallback" })
      },
    }
  },
})
