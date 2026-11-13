// Clean install proof for @casaelida/vue. It installs one package file into the Vite + Vue 3 + TypeScript app in app/,
// copied into a new empty directory outside any checkout, with a fresh pnpm store, an empty HOME and no user or global
// configuration, so neither a cache nor an authenticated session can stand in for an anonymous install. Then it checks:
// the packed file list and contents against their sources, the lockfile integrity, exactly one installed Vue that the
// package resolves as its peer, a strict typecheck with library checking, the build, and a browser test of the built output.
//
//   node tests/consumer/run.mjs                          builds and packs packages/vue
//   node tests/consumer/run.mjs --package FILE.tgz       a package file
//   node tests/consumer/run.mjs --package https://…/casaelida-vue-X.Y.Z.tgz   a published release asset
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageFiles } from '../../scripts/package.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const COMPONENTS = ['CEAttachmentGroup', 'CEButton', 'CEConversationList', 'CEMessageComposer', 'CEMessageList', 'CEPrice', 'CEProductCode', 'CETextField', 'CEWorkStatus'];
const FONTS = ['Inter-Bold', 'Inter-ExtraBold', 'Inter-Regular', 'Inter-SemiBold'];
// Every file the package may contain. A new file is a deliberate change to this list.
const EXPECTED = [
  'NOTICE', 'README.md', 'package.json', 'dist/index.js', 'dist/index.js.map', 'dist/index.d.ts', 'dist/internal/slot.d.ts', 'dist/styles.css', 'dist/fonts/OFL.txt',
  ...COMPONENTS.map((name) => `dist/components/${name}.vue.d.ts`), ...FONTS.map((name) => `dist/fonts/${name}.woff2`),
].sort();

const fail = (message) => { throw new Error(message); };
const argument = process.argv.indexOf('--package');
const given = argument > 0 ? process.argv[argument + 1] ?? fail('--package needs a file or URL') : null;
const work = await mkdtemp(join(await realpath(tmpdir()), 'ce-vue-consumer-'));
const app = join(work, 'app');
// Only what pnpm and Node need; everything user-level points into the empty work directory.
const isolated = {
  PATH: process.env.PATH, CI: process.env.CI ?? '', HOME: join(work, 'home'), npm_config_userconfig: join(work, 'home', '.npmrc'),
  XDG_CONFIG_HOME: join(work, 'xdg', 'config'), XDG_CACHE_HOME: join(work, 'xdg', 'cache'), XDG_DATA_HOME: join(work, 'xdg', 'data'), XDG_STATE_HOME: join(work, 'xdg', 'state'),
};
const run = (command, args, options = {}) => {
  console.log(`$ ${command} ${args.join(' ')}`);
  return execFileSync(command, args, { stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit', encoding: 'utf8', ...options });
};
const files = async (dir) => (await readdir(dir, { recursive: true, withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => relative(dir, join(entry.parentPath, entry.name))).sort();

try {
  // 1. The package file.
  let tarball;
  if (!given) {
    run('pnpm', ['--filter', '@casaelida/vue', 'build'], { cwd: repo });
    tarball = JSON.parse(run('pnpm', ['pack', '--pack-destination', work, '--json'], { cwd: join(repo, 'packages/vue'), capture: true })).filename;
  } else if (/^https:\/\//.test(given)) {
    const response = await fetch(given);
    if (!response.ok) fail(`${given}: HTTP ${response.status}`);
    tarball = join(work, basename(new URL(given).pathname));
    await writeFile(tarball, Buffer.from(await response.arrayBuffer()));
  } else {
    tarball = join(work, basename(given));
    await cp(given, tarball);
  }
  const bytes = await readFile(tarball);
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

  // 2. What the file contains: the expected list, the foundation exactly as its sources build it, the manifest, no local paths.
  await mkdir(join(work, 'packed'));
  run('tar', ['-xzf', tarball, '-C', join(work, 'packed')]);
  const root = join(work, 'packed', 'package');
  const packed = await files(root);
  if (JSON.stringify(packed) !== JSON.stringify(EXPECTED)) fail(`Packed files differ from the expected list.\n  packed:   ${packed.join(', ')}\n  expected: ${EXPECTED.join(', ')}`);
  for (const [path, content] of await packageFiles()) {
    if (!Buffer.from(content).equals(await readFile(join(root, 'dist', path)))) fail(`dist/${path} in the package differs from its tokens/, recipes/ and fonts/ sources.`);
  }
  const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (manifest.private !== true || manifest.exports?.['./styles.css'] !== './dist/styles.css' || JSON.stringify(manifest.sideEffects) !== '["./dist/styles.css"]'
    || manifest.peerDependencies?.vue !== '^3.5.0' || manifest.dependencies) fail('package.json lost private, the styles.css export, its sideEffects, the Vue peer, or gained dependencies.');
  const code = await readFile(join(root, 'dist/index.js'), 'utf8');
  if (!/from "vue"/.test(code) || /baseCreateRenderer/.test(code)) fail('dist/index.js must import Vue as a peer and bundle no Vue runtime.');
  for (const path of packed.filter((file) => !file.endsWith('.woff2'))) {
    const text = await readFile(join(root, path), 'utf8');
    for (const local of [repo.replace(/\/$/, ''), homedir(), '/home/', '/Users/', 'file://']) if (text.includes(local)) fail(`${path} contains a local path (${local}).`);
  }
  console.log(`Packed ${basename(tarball)} (${bytes.length} bytes, ${integrity}), ${packed.length} files:\n  ${packed.join('\n  ')}`);

  // 3. A clean install into an empty directory outside any checkout.
  await cp(fileURLToPath(new URL('app/', import.meta.url)), app, { recursive: true });
  await mkdir(isolated.HOME);
  await writeFile(isolated.npm_config_userconfig, '');
  const spec = given && /^https:\/\//.test(given) ? given : `file:./${basename(tarball)}`;
  if (spec.startsWith('file:')) await cp(tarball, join(app, basename(tarball)));
  const pkg = JSON.parse(await readFile(join(app, 'package.json'), 'utf8'));
  pkg.dependencies['@casaelida/vue'] = spec;
  await writeFile(join(app, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  const inApp = { cwd: app, env: isolated };
  run('pnpm', ['install', '--store-dir', join(work, 'store')], inApp);
  const lock = (await readFile(join(app, 'pnpm-lock.yaml'), 'utf8')).split('\n');
  const entry = lock.findIndex((line) => line.includes(`integrity: ${integrity}`));
  if (entry < 1 || !lock[entry - 1].trimStart().startsWith("'@casaelida/vue@")) fail(`pnpm-lock.yaml does not record ${integrity} for @casaelida/vue.`);
  const installed = await realpath(join(app, 'node_modules/@casaelida/vue'));
  if (!installed.startsWith(join(app, 'node_modules/.pnpm/'))) fail(`@casaelida/vue resolves outside the app: ${installed}`);

  // 4. Exactly one Vue in pnpm's dependency graph, and it is the one @casaelida/vue resolves as its peer.
  const graph = JSON.parse(run('pnpm', ['list', '--json', '--depth', 'Infinity'], { ...inApp, capture: true }));
  const vues = new Set();
  const walk = (deps = {}) => { for (const [name, node] of Object.entries(deps)) { if (name === 'vue') vues.add(node.path); walk(node.dependencies); } };
  for (const project of graph) { walk(project.dependencies); walk(project.devDependencies); }
  const peer = graph[0].dependencies['@casaelida/vue'].dependencies?.vue?.path;
  const store = (await readdir(join(app, 'node_modules/.pnpm'))).filter((name) => name.startsWith('vue@'));
  if (vues.size !== 1 || peer !== graph[0].dependencies.vue.path || store.length !== 1) fail(`Expected one vue: graph ${[...vues].join(', ')}; peer ${peer}; store ${store.join(', ')}`);
  console.log(`One vue in the graph (${store[0]}), resolved by @casaelida/vue as its peer.`);

  // 5. Strict typecheck (skipLibCheck false) and the production build.
  run('pnpm', ['run', 'typecheck'], inApp);
  run('pnpm', ['run', 'build'], inApp);

  // 6. The browser test of the built output.
  run('pnpm', ['exec', 'playwright', 'test', '--config', 'tests/consumer/playwright.config.mjs'], { cwd: repo, env: { ...process.env, CE_CONSUMER_DIR: app } });
  console.log('Clean install proof passed.');
} finally {
  if (process.env.CE_CONSUMER_KEEP) console.log(`Kept ${work}`);
  else await rm(work, { recursive: true, force: true });
}
