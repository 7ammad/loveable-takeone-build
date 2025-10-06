import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist'],
    testTimeout: 30000, // 30 seconds for API tests with rate limiting
    hookTimeout: 30000,
    teardownTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DISABLE_RATE_LIMIT: 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@packages': path.resolve(__dirname, './packages'),
    },
  },
});

