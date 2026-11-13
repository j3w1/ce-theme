import { defineConfig } from '@playwright/test';
import { projects } from './tests/browsers.mjs';

// A port of its own and never an existing server, so the tests can only reach the preview of this checkout.
// CE_BROWSER_PORT gives a parallel local run another port; the default, and CI's, is 4391.
const port = process.env.CE_BROWSER_PORT ?? '4391';
if (!/^\d{4,5}$/.test(port) || port < 1024 || port > 65535) throw new Error(`CE_BROWSER_PORT must be an integer from 1024 to 65535, not "${port}".`);
const PORT = Number(port);

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
