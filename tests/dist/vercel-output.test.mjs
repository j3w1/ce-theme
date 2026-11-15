// Exercise the provider's actual staging step, rather than simulate Vercel's rewrite resolution.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { distFiles, listFiles, readDist, root } from './output.mjs';

test('Vercel physically serves every unchanged Pages file under /ce-theme/ and clears stale output', async () => {
  const files = await distFiles();
  const original = await Promise.all(files.map((file) => readDist(file)));
  const output = new URL('dist-vercel/', root);
  const stage = () => execFileSync(process.execPath, [fileURLToPath(new URL('scripts/stage-vercel.mjs', root))]);
  stage();
  assert.deepEqual(await listFiles(output), files.map((file) => `ce-theme/${file}`).sort());
  for (const [index, file] of files.entries()) {
    assert.deepEqual(await readFile(new URL(`ce-theme/${file}`, output)), original[index], file);
    assert.deepEqual(await readDist(file), original[index], `Pages source stays unchanged: ${file}`);
  }
  const stale = new URL('ce-theme/stale.txt', output);
  await writeFile(stale, 'stale');
  stage();
  await assert.rejects(readFile(stale), { code: 'ENOENT' });
  assert.deepEqual(await listFiles(output), files.map((file) => `ce-theme/${file}`).sort());
});
