import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./wire-options-order"

const ruleTester = new RuleTester()

const commonCode = ts`
  import { createWire, tag, literal } from "@grlt-hub/app-compose"

  const apiUrl = tag<string>("apiUrl")
`

ruleTester.run("wire-options-order", rule, {
  valid: [
    {
      name: "correct order",
      code: ts`
        ${commonCode}

        createWire({ from: literal("https://api.example.com"), to: apiUrl })
      `,
    },
    {
      name: "single property",
      code: ts`
        ${commonCode}

        // @ts-expect-error
        createWire({ from: literal("https://api.example.com") })
      `,
    },
    {
      name: "argument is a factory call, not an object literal",
      code: ts`
        ${commonCode}

        declare const buildWire: (opts: Parameters<typeof createWire>[0]) => Parameters<typeof createWire>[0];
        createWire(buildWire({ to: apiUrl, from: literal("https://api.example.com"), }))
      `,
    },
    {
      name: "leading spread — shape undeterminable, left untouched",
      code: ts`
        ${commonCode}

        declare const rest: Parameters<typeof createWire>[0];
        createWire({ ...rest, to: apiUrl })
      `,
    },
  ],
  invalid: [
    {
      name: "to before from",
      code: ts`
        ${commonCode}

        createWire({ to: apiUrl, from: literal("https://api.example.com") })
      `,
      output: ts`
        ${commonCode}

        createWire({
        from: literal("https://api.example.com"),
        to: apiUrl
        })
    `,
      errors: [{ messageId: "invalidOrder" }],
    },
  ],
})
