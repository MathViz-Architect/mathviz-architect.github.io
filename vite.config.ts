/// <reference types="vitest" />
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from 'vitest/config'
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ] as any[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.GITHUB_PAGES === 'true' ? '/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: !isProd,
    minify: isProd ? 'esbuild' : false,
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['katex'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.idea',
      '.cache',
      '.output',
      '.bun',
      'coverage',
      'electron',
      '**/node_modules/**',
      '**/.bun/**'
    ],
    css: true,
    mockReset: true,
    clearMocks: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false
      }
    },
    coverage: {
      provider: "v8",
      reporter: ["text"],

      include: [
        "src/math-core/**/*.ts",
        "src/components/math-input/**/*.ts",
        "src/lib/engine/**/*.ts",
        "src/lib/math/**/*.ts"
      ],

      exclude: [
        "node_modules/",
        "dist/",
        "coverage/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",

        // large or non-critical code
        "src/lib/templates/**",
        "src/lib/db/**",
        "src/components/**/ui/**"
      ]
    }
  },
})
