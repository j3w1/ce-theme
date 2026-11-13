import { defineConfig } from '@playwright/test';
import { projects } from './tests/browsers.mjs';
import { ROUTES } from './tests/live/routes.mjs';

// The live smoke of the published site (issue #9 R6), never part of ordinary runs. It starts no server:
//   CE_SITE_URL=https://j3w1.github.io/ce-theme/ CE_EXPECT_COMMIT=<sha> CE_EXPECT_VERSION=<X.Y.Z> pnpm exec playwright test -c playwright.live.config.mjs
// It reuses foundation.spec.mjs's route checks (routes, images, links, page errors) and the messaging spec's conversation
// selection, which proves the /mensajeria/ island hydrated, and adds tests/live/live.spec.mjs.
const missing = ['CE_SITE_URL', 'CE_EXPECT_COMMIT', 'CE_EXPECT_VERSION'].filter((name) => !process.env[name]);
if (missing.length) throw new Error(`The live smoke needs ${missing.join(', ')}.`);
if (!/^[0-9a-f]{40}$/.test(process.env.CE_EXPECT_COMMIT)) throw new Error('CE_EXPECT_COMMIT must be the full 40-character commit SHA.');
if (!/^\d+\.\d+\.\d+$/.test(process.env.CE_EXPECT_VERSION)) throw new Error('CE_EXPECT_VERSION must be X.Y.Z.');
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

export default defineConfig({
  testDir: './tests',
  testMatch: ['browser/foundation.spec.mjs', 'browser/messaging.spec.mjs', 'live/live.spec.mjs'],
  grep: [new RegExp(` (?:${ROUTES.map(escape).join('|')}): renders without errors`), /selecting a conversation opens its history/, /live\.spec\.mjs/],
  // tests/live/propagation.mjs waits, for at most five minutes, until every route, version line, link and resource the tests
  // read comes from the expected deploy. The tests then get their own five-minute budget: a test that fails is retried after a pause
  // (tests/live/retry.mjs) while the same budget allows another attempt; then the failure counts. A retry's pass counts only
  // if its result arrives within the budget (tests/live/budget.mjs). 20 retries of 15 s cover five minutes.
  globalSetup: './tests/live/propagation.mjs',
  fullyParallel: true,
  workers: 2,
  retries: 20,
  timeout: 60_000,
  reporter: [['list'], ['./tests/live/budget.mjs']],
  outputDir: './test-results/live',
  use: { baseURL: process.env.CE_SITE_URL.replace(/\/?$/, '/'), trace: 'retain-on-failure' },
  projects,
});
