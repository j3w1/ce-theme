// Guard the second host's mount point: Astro emits /ce-theme/ links for Pages, including island imports and downloads.
// The provider's real routing and browser behaviour are checked by the existing live smoke after deployment.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Vercel serves the existing static build at its Pages base without an HTML catch-all', async () => {
  const config = JSON.parse(await read('vercel.json'));
  const astro = await read('astro.config.mjs');
  const base = astro.match(/base: '([^']+)'/)[1];
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.buildCommand, 'pnpm build');
  assert.equal(config.installCommand, 'pnpm install --frozen-lockfile');
  assert.equal(config.trailingSlash, true);
  assert.deepEqual(config.redirects, [{ source: '/', destination: base, permanent: false }]);
  assert.deepEqual(config.rewrites, [{ source: `${base}:path*`, destination: '/:path*' }]);
});
