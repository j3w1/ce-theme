import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  reporter: [['list']],
  outputDir: './test-results',
  use: { baseURL: 'http://127.0.0.1:4321', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm exec astro preview --host 127.0.0.1 --ignore-lock',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
