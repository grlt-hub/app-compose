import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./no-coda-debug"

const ruleTester = new RuleTester()

ruleTester.run("no-coda-debug", rule, {
  valid: [
    {
      name: "no debug import",
      code: ts`
        import { createTask } from "@app-compose/core"
        createTask({ name: "x", run: { fn: () => 1 } })
      `,
    },
    {
      name: "imported but never called",
      code: ts`
        import { debug } from "@app-compose/coda"
      `,
    },
    {
      name: "same name from another package",
      code: ts`
        import { debug } from "some-other-package"
        debug("noise")
      `,
    },
  ],
  invalid: [
    {
      name: "direct call",
      code: ts`
        import { debug } from "@app-compose/coda"
        debug("x")
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
    {
      name: "aliased import",
      code: ts`
        import { debug as dbg } from "@app-compose/coda"
        dbg("x")
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
    {
      name: "inside compose chain",
      code: ts`
        import { compose } from "@app-compose/core"
        import { debug } from "@app-compose/coda"
        compose().step(debug("x")).run()
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
  ],
})
