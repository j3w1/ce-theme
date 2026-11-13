import { defineConfig } from '@playwright/test';
import { projects } from '../browsers.mjs';

// Serves the consumer's built output (vite preview of dist/, not a development server) on a port of its own.
// tests/consumer/run.mjs builds the consumer and sets CE_CONSUMER_DIR.
const dir = process.env.CE_CONSUMER_DIR;
if (!dir) throw new Error('Run the consumer proof with `pnpm test:consumer`.');
// CE_CONSUMER_PORT gives a parallel local run another port; the default, and CI's, is 4392.
const port = process.env.CE_CONSUMER_PORT ?? '4392';
if (!/^\d{4,5}$/.test(port) || port < 1024 || port > 65535) throw new Error(`CE_CONSUMER_PORT must be an integer from 1024 to 65535, not "${port}".`);
const PORT = Number(port);

export default defineConfig({
  testDir: '.',
  testMatch: 'consumer.spec.mjs',
  timeout: 30_000,
  reporter: [['list']],
  outputDir: '../../test-results/consumer',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects,
  webServer: {
    command: `./node_modules/.bin/vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    cwd: dir,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
