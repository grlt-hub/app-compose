import { ts } from "@/shared/tag"
import { RuleTester } from "@typescript-eslint/rule-tester"
import rule from "./task-options-order"

const ruleTester = new RuleTester()

const commonCode = ts`
  import { createTask, literal } from "@grlt-hub/app-compose"

  const run = (x: number) => x + 1;
  const enabled = (x: boolean) => !x;
`

// @ts-expect-error idk
ruleTester.run("task-options-order", rule, {
  valid: [
    {
      name: "full",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { fn: run, context: literal('0') },
          enabled: { fn: enabled, context: literal(false) }
        })
      `,
    },
    {
      name: "without enabled.ctx",
      code: ts`
        ${commonCode}

        createTask({
          name: 'alpha',
          run: { fn: run, context: literal('0') },
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
          run: { fn: run, context: literal('0') },
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
  ],
  invalid: [
    {
      name: "name not in position",
      code: ts`
        ${commonCode}
        createTask({
          run: { fn: run, context: literal('0') },
          enabled: { fn: enabled, context: literal(false) },
          name: 'alpha',
        })
      `,
      output: ts`
        ${commonCode}
        createTask({ name: 'alpha', run: { fn: run, context: literal('0') }, enabled: { fn: enabled, context: literal(false) } })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.fn -> run.context -> enabled.fn -> enabled.context",
            currentOrder: "run.fn -> run.context -> enabled.fn -> enabled.context -> name",
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
          enabled: { fn: enabled, context: literal(false) },
          run: { fn: run, context: literal('0')},
        })
      `,
      output: ts`
        ${commonCode}

        createTask({ name: 'alpha', run: { fn: run, context: literal('0') }, enabled: { fn: enabled, context: literal(false) } })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.fn -> run.context -> enabled.fn -> enabled.context",
            currentOrder: "name -> enabled.fn -> enabled.context -> run.fn -> run.context",
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
          run: { context: literal('0'), fn: run },
          enabled: { fn: enabled, context: literal(false) },
        })
      `,
      output: ts`
        ${commonCode}

        createTask({ name: 'alpha', run: { fn: run, context: literal('0') }, enabled: { fn: enabled, context: literal(false) } })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.fn -> run.context -> enabled.fn -> enabled.context",
            currentOrder: "name -> run.context -> run.fn -> enabled.fn -> enabled.context",
          },
        },
      ],
    },
    {
      name: "enabled not in position",
      code: ts`
        ${commonCode}

        createTask({
          enabled: { fn: enabled, context: literal(false) },
          name: 'alpha',
          run: { fn: run, context: literal('0')},
        })
      `,
      output: ts`
        ${commonCode}

        createTask({ name: 'alpha', run: { fn: run, context: literal('0') }, enabled: { fn: enabled, context: literal(false) } })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.fn -> run.context -> enabled.fn -> enabled.context",
            currentOrder: "enabled.fn -> enabled.context -> name -> run.fn -> run.context",
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
          run: { fn: run, context: literal('0') },
          enabled: { context: literal(false), fn: enabled },
        })
      `,
      output: ts`
        ${commonCode}

        createTask({ name: 'alpha', run: { fn: run, context: literal('0') }, enabled: { fn: enabled, context: literal(false) } })
    `,
      errors: [
        {
          messageId: "invalidOrder",
          data: {
            correctOrder: "name -> run.fn -> run.context -> enabled.fn -> enabled.context",
            currentOrder: "name -> run.fn -> run.context -> enabled.context -> enabled.fn",
          },
        },
      ],
    },
  ],
})
