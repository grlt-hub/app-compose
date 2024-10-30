import tsconfigPaths from 'vite-tsconfig-paths';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
      include: ['**/__tests__/**/*.spec-d.ts?(x)'],
      exclude: [...defaultExclude, '**/build/**'],
    },
    include: ['src/**/__tests__/**/*.spec.ts?(x)'],
    exclude: [...defaultExclude, '**/build/**'],
    globals: true,
    reporters: 'dot',
    coverage: {
      extension: ['.ts', '.tsx'],
      all: true,
      include: ['src/**/*'],
      exclude: [...defaultExclude, 'src/**/ui/**', '**/build/**', 'src/**/__tests__/**'],
      reporter: 'text',
      provider: 'v8',
      // thresholds: {
      //   statements: 100,
      // },
      skipFull: true,
    },
    css: false,
    watch: false,
    pool: 'threads',
  },
  resolve: {
    mainFields: ['module'],
  },
});
