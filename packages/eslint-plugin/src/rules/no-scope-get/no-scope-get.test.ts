import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./no-scope-get"

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.ts*"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
})

ruleTester.run("no-scope-get", rule, {
  valid: [
    {
      name: "unrelated get method",
      code: ts`
        const registry = new Map<string, string>()
        registry.get("value")
      `,
    },
    {
      name: "unrelated type named Scope",
      code: ts`
        type Scope = { get: () => unknown }
        declare const scope: Scope
        scope.get()
      `,
    },
    {
      name: "run without reading the scope",
      code: ts`
        import { compose } from "@app-compose/core"
        await compose().run()
      `,
    },
  ],
  invalid: [
    {
      name: "scope returned by run",
      code: ts`
        import { compose, type Spot } from "@app-compose/core"
        declare const spot: Spot<string>

        const scope = await compose().run()
        scope.get(spot)
      `,
      errors: [{ messageId: "unexpectedScopeGet" }],
    },
    {
      name: "composer without a local compose call",
      code: ts`
        import type { Composer, Spot } from "@app-compose/core"
        declare const composer: Composer
        declare const spot: Spot<string>

        const scope = await composer.run()
        scope.get(spot)
      `,
      errors: [{ messageId: "unexpectedScopeGet" }],
    },
    {
      name: "scope in a promise callback",
      code: ts`
        import { compose, type Spot } from "@app-compose/core"
        declare const spot: Spot<string>

        compose().run().then((scope) => scope.get(spot))
      `,
      errors: [{ messageId: "unexpectedScopeGet" }],
    },
    {
      name: "scope from an observer event",
      code: ts`
        import type { ComposeObserver, Spot } from "@app-compose/core"
        declare const spot: Spot<string>

        const observe: ComposeObserver = (event) => {
          event.scope.get(spot)
        }
      `,
      errors: [{ messageId: "unexpectedScopeGet" }],
    },
  ],
})
