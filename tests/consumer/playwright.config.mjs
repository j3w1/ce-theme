import { defineConfig } from '@playwright/test';
import { projects } from '../browsers.mjs';

// Serves the consumer's built output (vite preview of dist/, not a development server) on a port of its own.
// tests/consumer/run.mjs builds the consumer and sets CE_CONSUMER_DIR.
const dir = process.env.CE_CONSUMER_DIR;
if (!dir) throw new Error('Run the consumer proof with `pnpm test:consumer`.');
const PORT = 4392;

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
