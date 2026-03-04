import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.local/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
})
