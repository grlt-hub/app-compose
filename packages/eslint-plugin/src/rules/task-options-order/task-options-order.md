---
description: Enforce options order createTask
---

# @grlt-hub/app-compose/keep-options-order

`createTask` accepts configuration in an object form. To maintain consistency and readability, configuration properties must follow the semantic order: `name` → `run.fn` → `run.context` → `enabled.fn` → `enabled.context`. This rule strictly enforces this sequence.

```ts
// 👍 great
createTask({
  name: "alpha",
  run: { fn: init, context: { timeout: timeoutTag } },
  enabled: { fn: check, context: { authorized: authorizedTag } },
})

// 👎 weird
createTask({
  name: "alpha",
  enabled: { fn: check, context: { authorized: authorizedTag } },
  run: { context: { timeout: timeoutTag }, fn: init },
})
```
