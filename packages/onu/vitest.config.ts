import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/index.ts", "src/**/types.ts", "src/ui/**"],
      reporter: ["text", "lcov", "json-summary"],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
        "src/thaana/**": { lines: 100, statements: 100, functions: 100, branches: 100 },
      },
    },
  },
})
