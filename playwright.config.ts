import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT ?? 4300)
const chromiumPath = process.env.CHROMIUM_PATH

/** E2E, accessibility and visual tests against the web app (REQUIREMENTS §17 R17.3). */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Baselines are created on first run and compared afterwards.
  updateSnapshots: "missing",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm --filter onu-web preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: chromiumPath ? { executablePath: chromiumPath } : {} },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], launchOptions: chromiumPath ? { executablePath: chromiumPath } : {} },
    },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
})
