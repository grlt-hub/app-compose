import type { TSESTree as Node } from "@typescript-eslint/utils"
import { PACKAGE_NAME, UNITS } from "@/shared/constants"
import { createRule } from "@/shared/create"

const importSelector = `ImportDeclaration[source.value=${PACKAGE_NAME.CODA}]`
const specifierSelector = `ImportSpecifier[imported.name=${UNITS.DEBUG}]`
const callSelector = `[callee.type="Identifier"]`

export default createRule({
  name: "no-coda-debug",
  meta: {
    type: "problem",
    docs: {
      description: `Disallow \`${UNITS.DEBUG}()\` calls from ${PACKAGE_NAME.CODA} in committed code`,
    },
    messages: {
      unexpectedDebug: `Unexpected \`${UNITS.DEBUG}()\` call from ${PACKAGE_NAME.CODA}.`,
    },
    schema: [],
    hasSuggestions: false,
  },
  defaultOptions: [],
  create: (context) => {
    const imports = new Set<string>()

    type DebugCall = Node.CallExpression & { callee: Node.Identifier }

    return {
      [`${importSelector} > ${specifierSelector}`]: (node: Node.ImportSpecifier) => void imports.add(node.local.name),

      [`CallExpression${callSelector}`]: (node: DebugCall) => {
        if (!imports.has(node.callee.name)) return
        context.report({ node, messageId: "unexpectedDebug" })
      },
    }
  },
})
