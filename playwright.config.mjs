import { defineConfig } from '@playwright/test';
import { projects } from './tests/browsers.mjs';

// A port of its own and never an existing server, so the tests can only reach the preview of this checkout.
const PORT = 4391;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  reporter: [['list']],
  outputDir: './test-results',
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  projects,
  webServer: {
    command: `pnpm exec astro preview --host 127.0.0.1 --port ${PORT} --ignore-lock`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
