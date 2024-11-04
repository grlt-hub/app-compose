import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
      include: ['./src/**/__tests__/**/*.spec-d.ts?(x)'],
      exclude: defaultExclude,
    },
    include: ['./src/**/__tests__/**/*.spec.ts?(x)'],
    exclude: defaultExclude,
    globals: true,
    reporters: 'dot',
    coverage: {
      extension: ['.ts', '.tsx'],
      all: true,
      include: ['src/**/*'],
      exclude: [...defaultExclude, './src/**/__fixtures__/**', 'src/**/__tests__/**', './src/index.ts'],
      reporter: 'text',
      provider: 'v8',
      thresholds: {
        100: true,
      },
    },
    css: false,
    watch: false,
    pool: 'threads',
  },
  resolve: {
    mainFields: ['module'],
  },
});
