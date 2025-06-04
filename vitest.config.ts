import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupVitest.ts',
    coverage: {
      provider: 'v8', // Using v8 for coverage
      reporter: ['text', 'json', 'html'],
      all: true, // Ensure all files in include are processed, even if no tests import them
      include: ['src/**/*.{ts,tsx}'], // Specify files to include in coverage
      exclude: [ // Standard exclusions
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts,cjs,mjs,cts,mts}',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        'src/main.tsx', // Or your main entry point if not a library
        'src/**/index.ts', // Often barrel files
        'src/**/types.ts', // Or similar type definition files
        'src/**/constants.ts', // Or similar constant definition files
      ],
    },
  },
});
