import { defineConfig } from '@playwright/test';
import { projects } from './tests/browsers.mjs';
import astro from './astro.config.mjs';

// A port of its own and never an existing server, so the tests can only reach the preview of this checkout.
// CE_BROWSER_PORT gives a parallel local run another port; the default, and CI's, is 4391.
const port = process.env.CE_BROWSER_PORT ?? '4391';
if (!/^\d{4,5}$/.test(port) || port < 1024 || port > 65535) throw new Error(`CE_BROWSER_PORT must be an integer from 1024 to 65535, not "${port}".`);
const PORT = Number(port);
// The preview serves the site under Astro's base, so baseURL keeps it and the specs navigate with base-relative paths.
const site = `http://127.0.0.1:${PORT}${astro.base}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  reporter: [['list']],
  outputDir: './test-results',
  use: { baseURL: site, trace: 'retain-on-failure' },
  projects,
  webServer: {
    command: `pnpm exec astro preview --host 127.0.0.1 --port ${PORT} --ignore-lock`,
    url: site,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
