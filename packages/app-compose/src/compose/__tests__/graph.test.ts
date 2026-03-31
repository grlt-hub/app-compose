import { literal, optional } from "@computable"
import { createTask, createWire, tag } from "@runnable"
import { describe, expect, it, vi } from "vitest"
import { compose, Node$ } from "../compose"
import { graph } from "../graph"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ value: true }) } })

describe("graph", () => {
  describe("tasks", () => {
    it("zero dependencies", () => {
      const app = compose().step(alphaTask)

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("missing dependency", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const app = compose().step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "beta", kind: "task" }, dependencies: { required: [-1], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("direct dependency on another task", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const app = compose().step(alphaTask).step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
          { type: "run", id: 1, meta: { name: "beta", kind: "task" }, dependencies: { required: [0], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("direct dependency on another task [optional]", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: optional(alphaTask.result.value) } })

      const app = compose().step(alphaTask).step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
          { type: "run", id: 1, meta: { name: "beta", kind: "task" }, dependencies: { required: [], optional: [0] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("dependency on a literal", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: literal(true) } })

      const app = compose().step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "beta", kind: "task" }, dependencies: { required: [], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe("status", () => {
    it("task depends on another task's status", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.status } })

      const app = compose().step(alphaTask).step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
          { type: "run", id: 1, meta: { name: "beta", kind: "task" }, dependencies: { required: [0], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("task depends on another task's status [optional]", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: optional(alphaTask.status) } })

      const app = compose().step(alphaTask).step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
          { type: "run", id: 1, meta: { name: "beta", kind: "task" }, dependencies: { required: [], optional: [0] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe("tags", () => {
    it("dependency on a task via a tag", () => {
      const valueTag = tag<boolean>("value")
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: valueTag.value } })

      const app = compose().step(alphaTask).step(createWire(valueTag, alphaTask.result.value)).step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "run",
            id: 0,
            meta: { name: "alpha", kind: "task" },
            dependencies: { required: [], optional: [] },
          },
          {
            type: "run",
            id: 1,
            meta: { name: "value", kind: "wire" },
            dependencies: { required: [0], optional: [] },
          },
          {
            type: "run",
            id: 2,
            meta: { name: "beta", kind: "task" },
            dependencies: { required: [1], optional: [] },
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("dependency on a task via a tag [optional]", () => {
      const valueTag = tag<boolean>("value")
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: optional(valueTag.value) } })

      const app = compose()
        .step(alphaTask)
        .step(createWire(valueTag, optional(alphaTask.result.value)))
        .step(betaTask)

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "run",
            id: 0,
            meta: { name: "alpha", kind: "task" },
            dependencies: { required: [], optional: [] },
          },
          {
            type: "run",
            id: 1,
            meta: { name: "value", kind: "wire" },
            dependencies: { required: [], optional: [0] },
          },
          {
            type: "run",
            id: 2,
            meta: { name: "beta", kind: "task" },
            dependencies: { required: [], optional: [1] },
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("task depends on a literal via tag", () => {
      const valueTag = tag<boolean>("value")
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: valueTag.value } })

      const app = compose()
        .step(createWire(valueTag, literal(false)))
        .step(betaTask)

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "run",
            id: 0,
            meta: { name: "value", kind: "wire" },
            dependencies: { required: [], optional: [] },
          },
          {
            type: "run",
            id: 1,
            meta: { name: "beta", kind: "task" },
            dependencies: { required: [0], optional: [] },
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe("optional", () => {
    it("optional missing dependency", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: optional(alphaTask.result.value) } })

      const app = compose().step(betaTask)
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          { type: "run", meta: { name: "beta", kind: "task" }, id: 0, dependencies: { required: [], optional: [] } },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe("mixed dependencies", () => {
    it("required and optional", () => {
      const fn = tag<() => void>("fn")

      const betaTask = createTask({
        name: "beta",
        run: {
          context: { value: alphaTask.result.value, fn: optional(fn.value) },
          fn: vi.fn(),
        },
      })

      const app = compose()
        .step(alphaTask)
        .step(createWire(fn, literal(vi.fn())))
        .step(betaTask)

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "run",
            id: 0,
            meta: { name: "alpha", kind: "task" },
            dependencies: { required: [], optional: [] },
          },
          {
            type: "run",
            id: 1,
            meta: { name: "fn", kind: "wire" },
            dependencies: { required: [], optional: [] },
          },
          {
            type: "run",
            id: 2,
            meta: { name: "beta", kind: "task" },
            dependencies: { required: [0], optional: [1] },
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe("tree structure", () => {
    it("produces a con node for concurrent step", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn() } })

      const app = compose().step([alphaTask, betaTask])

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "con",
            meta: { name: undefined },
            children: [
              {
                type: "run",
                id: 0,
                meta: { name: "alpha", kind: "task" },
                dependencies: { required: [], optional: [] },
              },
              {
                type: "run",
                id: 1,
                meta: { name: "beta", kind: "task" },
                dependencies: { required: [], optional: [] },
              },
            ],
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("produces nested seq node with nested compose", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const inner = compose().step(alphaTask).step(betaTask)
      const app = compose().step(inner)

      const result = graph(app[Node$])
      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "seq",
            meta: { name: undefined },
            children: [
              {
                type: "run",
                id: 0,
                meta: { name: "alpha", kind: "task" },
                dependencies: { required: [], optional: [] },
              },
              {
                type: "run",
                id: 1,
                meta: { name: "beta", kind: "task" },
                dependencies: { required: [0], optional: [] },
              },
            ],
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("exposes meta name", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const app = compose()
        .meta({ name: "root" })
        .step(alphaTask)
        .step(compose().meta({ name: "inner" }).step(betaTask))

      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: "root" },
        children: [
          { type: "run", id: 0, meta: { name: "alpha", kind: "task" }, dependencies: { required: [], optional: [] } },
          {
            type: "seq",
            meta: { name: "inner" },
            children: [
              {
                type: "run",
                id: 1,
                meta: { name: "beta", kind: "task" },
                dependencies: { required: [0], optional: [] },
              },
            ],
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("identifies concurrent seq nodes graph independently", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const gammaTask = createTask({ name: "gamma", run: { fn: vi.fn() } })
      const deltaTask = createTask({ name: "delta", run: { fn: vi.fn(), context: gammaTask.result.value } })

      const app = compose().step([
        compose().meta({ name: "left" }).step(alphaTask).step(betaTask),
        compose().meta({ name: "right" }).step(gammaTask).step(deltaTask),
      ])
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "con",
            meta: { name: undefined },
            children: [
              {
                type: "seq",
                meta: { name: "left" },
                children: [
                  {
                    type: "run",
                    id: 0,
                    meta: { name: "alpha", kind: "task" },
                    dependencies: { required: [], optional: [] },
                  },
                  {
                    type: "run",
                    id: 1,
                    meta: { name: "beta", kind: "task" },
                    dependencies: { required: [0], optional: [] },
                  },
                ],
              },
              {
                type: "seq",
                meta: { name: "right" },
                children: [
                  {
                    type: "run",
                    id: 2,
                    meta: { name: "gamma", kind: "task" },
                    dependencies: { required: [], optional: [] },
                  },
                  {
                    type: "run",
                    id: 3,
                    meta: { name: "delta", kind: "task" },
                    dependencies: { required: [2], optional: [] },
                  },
                ],
              },
            ],
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })

    it("marks guard-failing neighbor borrow as missing", () => {
      const betaTask = createTask({ name: "beta", run: { fn: vi.fn(), context: alphaTask.result.value } })

      const app = compose().step([alphaTask, betaTask])
      const result = graph(app[Node$])

      const expected = {
        type: "seq",
        meta: { name: undefined },
        children: [
          {
            type: "con",
            meta: { name: undefined },
            children: [
              {
                type: "run",
                id: 0,
                meta: { name: "alpha", kind: "task" },
                dependencies: { required: [], optional: [] },
              },
              {
                type: "run",
                id: 1,
                meta: { name: "beta", kind: "task" },
                dependencies: { required: [0 /* should probably be -1 */], optional: [] },
              },
            ],
          },
        ],
      }

      expect(result).toStrictEqual(expected)
    })
  })
})
