import { defineConfig } from "@playwright/test";

const production = process.env.TEST_PRODUCTION === "1";
const baseURL = production ? "http://localhost:4173" : "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: production
      ? "npm run preview -- --host 0.0.0.0 --port 4173"
      : "npm run dev -- --host 0.0.0.0",
    url: baseURL,
    reuseExistingServer: true,
  },
});
