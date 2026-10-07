import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const onuSrc = resolve(__dirname, "../packages/onu/src")

export default defineConfig({
  base: process.env.EXAMPLES_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    // Use the package source directly so edits show up without a rebuild.
    alias: [
      { find: /^@javaabu\/onu\/(tailwind|styles|fonts|fonts-optional)\.css$/, replacement: `${onuSrc}/styles/$1.css` },
      { find: /^@javaabu\/onu\/icons\/(iconify|fontawesome)$/, replacement: `${onuSrc}/icons/$1/index.tsx` },
      { find: /^@javaabu\/onu\/(thaana|charts|maps|editor|calendar|media)$/, replacement: `${onuSrc}/$1/index.ts` },
      { find: /^@javaabu\/onu$/, replacement: `${onuSrc}/index.ts` },
      { find: /^@\//, replacement: `${resolve(__dirname, "src")}/` },
    ],
  },
})
