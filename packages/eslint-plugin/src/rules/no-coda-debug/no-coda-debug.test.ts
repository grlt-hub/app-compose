import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./no-coda-debug"

const ruleTester = new RuleTester()

ruleTester.run("no-coda-debug", rule, {
  valid: [
    {
      name: "no debug import",
      code: ts`
        import { createTask } from "@grlt-hub/app-compose"
        createTask({ name: "x", run: { fn: () => 1 } })
      `,
    },
    {
      name: "imported but never called",
      code: ts`
        import { debug } from "@grlt-hub/app-coda"
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
        import { debug } from "@grlt-hub/app-coda"
        debug("x")
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
    {
      name: "aliased import",
      code: ts`
        import { debug as dbg } from "@grlt-hub/app-coda"
        dbg("x")
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
    {
      name: "inside compose chain",
      code: ts`
        import { compose } from "@grlt-hub/app-compose"
        import { debug } from "@grlt-hub/app-coda"
        compose().step(debug("x")).run()
      `,
      errors: [{ messageId: "unexpectedDebug" }],
    },
  ],
})
