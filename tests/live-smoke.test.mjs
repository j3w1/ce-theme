// The live smoke of the published site (playwright.live.config.mjs and tests/live/, issue #9 R6) is configured from the
// environment. A site URL that carries a credential, a query or a fragment is refused before anything can print it, and
// the propagation preflight never prints more of the URL than its origin and path.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const SECRET = 'not-a-real-secret-4d1f';
const env = (site) => ({ CE_SITE_URL: site, CE_EXPECT_COMMIT: 'a'.repeat(40), CE_EXPECT_VERSION: '1.2.3' });

/** Loads the live Playwright config in a fresh Node process with the given CE_SITE_URL. */
const load = (site) => spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(new URL('playwright.live.config.mjs', root).href)});`], {
  cwd: root, env: { ...process.env, ...env(site) }, encoding: 'utf8',
});

test('the live config refuses a site URL with credentials, a query or a fragment, without printing it', () => {
  for (const site of [`https://user:${SECRET}@j3w1.github.io/ce-theme/`, `https://j3w1.github.io/ce-theme/?token=${SECRET}`, `https://j3w1.github.io/ce-theme/#${SECRET}`]) {
    const run = load(site);
    assert.notEqual(run.status, 0, 'refused');
    assert.match(run.stderr, /CE_SITE_URL must be an http or https URL with no credentials, query or fragment/);
    assert.ok(!`${run.stdout}${run.stderr}`.includes(SECRET), 'the refusal does not print the URL');
  }
  assert.equal(load('https://j3w1.github.io/ce-theme/').status, 0, 'a plain site URL is accepted');
});

test('when propagation runs out of time, its error names only the origin and path of the site', async () => {
  const saved = { fetch: globalThis.fetch, now: Date.now, env: { ...process.env } };
  let clock = 1_000_000;
  try {
    // The preflight is given a URL the config would refuse, and a request error that names the URL it was given.
    Object.assign(process.env, env(`https://user:${SECRET}@j3w1.github.io/ce-theme/?token=${SECRET}#${SECRET}`));
    Date.now = () => clock;
    globalThis.fetch = async (url) => { clock += 6 * 60_000; throw new TypeError(`Request cannot be constructed from a URL that includes credentials: ${url}`); };
    const { default: waitForDeploy } = await import('./live/propagation.mjs');
    await assert.rejects(waitForDeploy(), (error) => {
      assert.match(error.message, /^https:\/\/j3w1\.github\.io\/ce-theme\/ did not serve the expected deploy within five minutes \(last: a request failed: TypeError\)\.$/);
      assert.ok(!error.message.includes(SECRET));
      return true;
    });
  } finally {
    globalThis.fetch = saved.fetch;
    Date.now = saved.now;
    for (const name of Object.keys(process.env)) if (!(name in saved.env)) delete process.env[name];
    Object.assign(process.env, saved.env);
  }
});
