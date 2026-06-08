import { RuleTester } from "@typescript-eslint/rule-tester"
import { ts } from "@/shared/tag"
import rule from "./task-options-order"

const ruleTester = new RuleTester()

const commonCode = ts`
  import { createTask, literal } from "@grlt-hub/app-compose"

  const run = (x: number) => x + 1;
  const enabled = (x: boolean) => !x;
`

ruleTester.run("task-options-order", rule, {
  valid: [
    {
      name: "full",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { context: literal('0'), fn: run },
          enabled: { context: literal(false), fn: enabled }
        })
      `,
    },
    {
      name: "without enabled.ctx",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { context: literal('0'), fn: run },
          enabled: { fn: enabled }
        })
      `,
    },
    {
      name: "without enabled",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { context: literal('0'), fn: run },
        })
      `,
    },
    {
      name: "without run.ctx",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { fn: run },
        })
      `,
    },
    {
      name: "mixed",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { fn: run },
          enabled: { fn: enabled }
        })
      `,
    },
    {
      name: "shorthand run and enabled are left untouched",
      code: ts`
        ${commonCode}

        createTask({ name: 'alpha', run, enabled })
      `,
    },
    {
      name: "argument is a factory call, not an object literal",
      code: ts`
        ${commonCode}

        declare const factory: (opts: { name: string }) => Parameters<typeof createTask>[0];
        createTask(factory({ name: 'alpha' }))
      `,
    },
  ],
  invalid: [
    {
      name: "name not in position",
      code: ts`
        ${commonCode}
        createTask({
          run: { context: literal('0'), fn: run },
          enabled: { context: literal(false), fn: enabled },
          name: 'alpha',
        })
      `,
      output: ts`
        ${commonCode}
        createTask({
        name: 'alpha',
        run: { context: literal('0'), fn: run },
        enabled: { context: literal(false), fn: enabled }
        })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.context -> run.fn -> enabled.context -> enabled.fn",
            currentOrder: "run.context -> run.fn -> enabled.context -> enabled.fn -> name",
          },
        },
      ],
    },
    {
      name: "run not in position",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          enabled: { context: literal(false), fn: enabled },
          run: { context: literal('0'), fn: run},
        })
      `,
      output: ts`
        ${commonCode}

        createTask({
        name: 'alpha',
        run: { context: literal('0'), fn: run },
        enabled: { context: literal(false), fn: enabled }
        })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.context -> run.fn -> enabled.context -> enabled.fn",
            currentOrder: "name -> enabled.context -> enabled.fn -> run.context -> run.fn",
          },
        },
      ],
    },
    {
      name: "run.fn not in position",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { fn: run, context: literal('0') },
          enabled: { context: literal(false), fn: enabled },
        })
      `,
      output: ts`
        ${commonCode}

        createTask({
        name: 'alpha',
        run: { context: literal('0'), fn: run },
        enabled: { context: literal(false), fn: enabled }
        })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.context -> run.fn -> enabled.context -> enabled.fn",
            currentOrder: "name -> run.fn -> run.context -> enabled.context -> enabled.fn",
          },
        },
      ],
    },
    {
      name: "enabled not in position",
      code: ts`
        ${commonCode}

        createTask({
          enabled: { context: literal(false), fn: enabled },
          name: 'alpha',
          run: { context: literal('0'), fn: run},
        })
      `,
      output: ts`
        ${commonCode}

        createTask({
        name: 'alpha',
        run: { context: literal('0'), fn: run },
        enabled: { context: literal(false), fn: enabled }
        })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.context -> run.fn -> enabled.context -> enabled.fn",
            currentOrder: "enabled.context -> enabled.fn -> name -> run.context -> run.fn",
          },
        },
      ],
    },
    {
      name: "enabled.fn not in position",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { context: literal('0'), fn: run },
          enabled: { fn: enabled, context: literal(false) },
        })
      `,
      output: ts`
        ${commonCode}

        createTask({
        name: 'alpha',
        run: { context: literal('0'), fn: run },
        enabled: { context: literal(false), fn: enabled }
        })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.context -> run.fn -> enabled.context -> enabled.fn",
            currentOrder: "name -> run.context -> run.fn -> enabled.fn -> enabled.context",
          },
        },
      ],
    },
    {
      name: "misordered shorthand run is reordered, shorthand preserved",
      code: ts`
        ${commonCode}

        createTask({ run, name: 'alpha' })
      `,
      output: ts`
        ${commonCode}

        createTask({
        name: 'alpha',
        run
        })
      `,
      errors: [
        {
          messageId: "invalidOrder",
          data: { correctOrder: "name -> run", currentOrder: "run -> name" },
        },
      ],
    },
    {
      name: "misordered config with a spread in run — top level reordered, spread preserved",
      code: ts`
        ${commonCode}

        const base = { context: literal('0') };
        createTask({ run: { ...base, fn: run }, name: 'alpha' })
      `,
      output: ts`
        ${commonCode}

        const base = { context: literal('0') };
        createTask({
        name: 'alpha',
        run: { ...base, fn: run }
        })
      `,
      errors: [
        {
          messageId: "invalidOrder",
          data: { correctOrder: "name -> run.fn", currentOrder: "run.fn -> name" },
        },
      ],
    },
    {
      name: "nested key would cross a spread — reported, but not autofixed",
      code: ts`
        ${commonCode}

        const base = { fn: run };
        createTask({ run: { fn: run, ...base, context: literal('0') }, name: 'alpha' })
      `,
      output: null,
      errors: [{ messageId: "invalidOrder" }],
    },
  ],
})
