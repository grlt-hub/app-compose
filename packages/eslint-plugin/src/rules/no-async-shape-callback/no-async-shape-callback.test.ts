import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./no-async-shape-callback"

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

ruleTester.run("no-async-shape-callback", rule, {
  valid: [
    {
      name: "sync callback",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        shape({ user }, (x) => x.user)
      `,
    },
    {
      name: "no callback",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        shape({ user })
      `,
    },
    {
      name: "sync callback passed by reference",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        const pickUser = (x: { user: string }) => x.user
        shape({ user }, pickUser)
      `,
    },
    {
      name: "same name from another package",
      code: ts`
        import { shape } from "some-other-package"
        shape({ user }, async (x) => x.user)
      `,
    },
  ],
  invalid: [
    {
      name: "async arrow callback",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        shape({ user }, async (x) => x.user)
      `,
      errors: [{ messageId: "asyncCallback" }],
    },
    {
      name: "async function expression",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        shape({ user }, async function (x) {
          return x.user
        })
      `,
      errors: [{ messageId: "asyncCallback" }],
    },
    {
      name: "async callback passed by reference",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        const pickUser = async (x: { user: string }) => x.user
        shape({ user }, pickUser)
      `,
      errors: [{ messageId: "asyncCallback" }],
    },
    {
      name: "sync callback returning a promise",
      code: ts`
        import { shape } from "@grlt-hub/app-compose"
        shape({ user }, (x) => Promise.resolve(x.user))
      `,
      errors: [{ messageId: "asyncCallback" }],
    },
    {
      name: "aliased import",
      code: ts`
        import { shape as sh } from "@grlt-hub/app-compose"
        sh({ user }, async (x) => x.user)
      `,
      errors: [{ messageId: "asyncCallback" }],
    },
  ],
})
