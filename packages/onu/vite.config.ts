import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}
const externals = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
const isExternal = (id: string) =>
  externals.some((dep) => id === dep || id.startsWith(`${dep}/`)) || /^(react|react-dom)(\/|$)/.test(id)

/** Library entry points, mirrored by package.json `exports` (R2.5). */
const entries = {
  index: "src/index.ts",
  "ui/index": "src/ui/index.ts",
  "thaana/index": "src/thaana/index.ts",
  "locales/dv/index": "src/locales/dv/index.ts",
  "charts/index": "src/charts/index.ts",
  "maps/index": "src/maps/index.ts",
  "editor/index": "src/editor/index.ts",
  "calendar/index": "src/calendar/index.ts",
  "media/index": "src/media/index.ts",
  "export/index": "src/export/index.ts",
  "icons/iconify/index": "src/icons/iconify/index.tsx",
  "icons/fontawesome/index": "src/icons/fontawesome/index.tsx",
}

export default defineConfig({
  plugins: [react()],
  build: {
    // size-limit measures bundle sizes; skipping Vite's per-file gzip pass saves time and memory.
    reportCompressedSize: false,
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, resolve(__dirname, v)])),
      formats: ["es"],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        // Every module may run on the client; mark them for React Server Components (R2.9).
        banner: '"use client";',
      },
    },
  },
})
