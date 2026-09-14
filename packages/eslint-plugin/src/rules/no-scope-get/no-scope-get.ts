import { ESLintUtils, type TSESTree as Node } from "@typescript-eslint/utils"
import { createRule } from "@/shared/create"
import { isType } from "@/shared/is"

export default createRule({
  name: "no-scope-get",
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow imperative `scope.get()` calls",
    },
    messages: {
      unexpectedScopeGet:
        "`scope.get()` can lead to imperative work outside the composition. Put the work in a Task and pass values through its context.",
    },
    schema: [],
    hasSuggestions: false,
  },
  defaultOptions: [],
  create: (context) => {
    const services = ESLintUtils.getParserServices(context)

    type ScopeGetCall = Node.CallExpression & { callee: Node.MemberExpression & { property: Node.Identifier } }

    return {
      [`CallExpression[callee.type="MemberExpression"][callee.property.type="Identifier"][callee.property.name="get"]`]:
        (node: ScopeGetCall) => {
          const type = services.getTypeAtLocation(node.callee.object)

          const isScope = isType.scope(type, services.program)
          if (!isScope) return

          context.report({ node, messageId: "unexpectedScopeGet" })
        },
    }
  },
})
