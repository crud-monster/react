import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import graphql from '@rollup/plugin-graphql'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [graphql(), react(), tailwindcss()],
    build: { target: 'es2020' },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.ts'],
      clearMocks: true,
    },
  }
})
