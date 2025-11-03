import { defaultExclude, defineConfig } from 'vitest/config';

const cwd = process.cwd();

export default defineConfig({
  test: {
    setupFiles: './vitest.setup.ts',
    environment: 'node',
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
      include: ['./src/**/__tests__/**/*.spec-d.ts'],
      exclude: defaultExclude,
    },
    include: ['./src/**/__tests__/**/*.spec.ts'],
    exclude: defaultExclude,
    globals: true,
    reporters: 'dot',
    coverage: {
      all: true,
      include: ['src/**/*.ts'],
      exclude: [...defaultExclude, '**/__fixtures__/**', '**/__tests__/**', './src/index.ts'],
      reporter: 'text',
      provider: 'v8',
      thresholds: {
        100: true,
      },
    },
    css: false,
    watch: false,
    pool: 'threads',
    alias: {
      '@randomContainer': cwd + '/src/compose/__fixtures__/createRandomContainer',
      '@createContainer': cwd + '/src/createContainer',
      '@shared': cwd + '/src/shared',
      '@prepareStages': cwd + '/src/compose/prepareStages',
    },
  },
  resolve: {
    mainFields: ['module'],
  },
});
