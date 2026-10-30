import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NAMES } from '../recipes/names.mjs';
import { RECIPE_SOURCES } from '../scripts/sources.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const TITLE = 'CE Theme — Design System';

// Repository-relative paths always use "/" (what git, URLs and the other tests use), whatever the operating system's separator is.
export const toPosix = (path, separator = sep) => path.split(separator).join('/');

// Lists files under a repository folder. readdir returns paths relative to that folder with the platform separator; the
// folder is converted with fileURLToPath, never by slicing a URL pathname (which breaks on Windows drive paths).
export async function files(folder, pattern) {
  const entries = await readdir(fileURLToPath(new URL(folder, root)), { recursive: true });
  return entries.filter((entry) => pattern.test(entry)).map((entry) => toPosix(`${folder}${entry}`));
}

test('the design-system title has one source, ce-theme.json, and every generated file reads it', async () => {
  const manifest = JSON.parse(await read('ce-theme.json'));
  assert.equal(manifest.designSystemName, TITLE);
  assert.equal(manifest.name, 'Casa Elida', 'the brand name stays Casa Elida');
  assert.equal(JSON.parse(await read('exports/design-system/publish.json')).title, TITLE);
  assert.equal(JSON.parse(await read('exports/design-system/project/tokens.json')).name, TITLE);
  assert.match((await read('exports/design-system/project/tokens.css')).split('\n')[0], new RegExp(`^/\\* ${TITLE}`));
  // The title is not repeated in the generator: it reads manifest.designSystemName, and the brand name is not reused for it.
  const generator = await read('scripts/design-system.mjs');
  assert.ok(!generator.includes(TITLE), 'the generator does not hard-code the title');
  assert.match(generator, /title: manifest\.designSystemName/);
  assert.match(generator, /name: manifest\.designSystemName/);
  assert.doesNotMatch(generator, /(title|name): manifest\.name\b/);
  // The brand name remains in legitimate places such as the CSS header comments.
  assert.match(await read('exports/tokens.css'), /^\/\* Casa Elida /);
});

test('CE Meta is described as the administration platform and CE Meta App as the messaging app', async () => {
  const readme = await read('design-system/README.md');
  assert.match(readme, /CE Meta \(the internal administration and control platform\)/);
  assert.match(readme, /CE Meta App \(the messaging app, planned\)/);
  const decisions = await read('docs/decisions.md');
  const row = decisions.split('\n').find((line) => line.includes('| Application identities |'));
  assert.ok(row, 'docs/decisions.md records the application identities');
  for (const repository of ['j3w1/ce-meta`', 'j3w1/ce-meta-app', 'j3w1/ce-theme', 'j3w1/casaelida.com']) assert.ok(row.includes(repository), `identities row names ${repository}`);
  // No document describes CE Meta as the customer-messaging application.
  const folders = ['docs/', 'design-system/', 'site/', 'recipes/', 'packages/vue/src/', 'packages/vue/test/'];
  const candidates = ['README.md', 'AGENTS.md', 'CHANGELOG.md', 'packages/vue/README.md'];
  for (const folder of folders) candidates.push(...await files(folder, /\.(md|mjs|astro|vue|ts|css)$/));
  for (const file of candidates) {
    const text = await read(file);
    assert.doesNotMatch(text, /CE Meta\s*\(\s*customer messaging\s*\)/i, file);
    assert.doesNotMatch(text, /\bCE Meta (is|as) (the |a |our )?(customer[- ])?messaging (app|application)/i, file);
  }
});

test('the messaging recipes are a generated recipe source and use no literal colours', async () => {
  assert.ok(RECIPE_SOURCES.includes('recipes/messaging.css'));
  const css = await read('recipes/messaging.css');
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i);
  assert.ok((await read('exports/recipes.css')).includes('.ce-composer--note'));
  assert.ok((await read('site/layouts/Layout.astro')).includes("recipes/messaging.css"), 'the showcase loads the recipes');
});

test('the standard names cover the three public components, and the message bubble stays private', async () => {
  for (const component of ['CEConversationList', 'CEMessageList', 'CEMessageComposer']) {
    assert.ok(NAMES.some((entry) => entry.vue === component && entry.group === 'Mensajería'), `${component} has a Mensajería name`);
  }
  assert.ok(!NAMES.some((entry) => entry.vue === 'CEMessageBubble'));
  const index = await read('packages/vue/src/index.ts');
  assert.doesNotMatch(index, /CEMessageBubble/);
  assert.deepEqual((await readdir(new URL('packages/vue/src/components/', root))).filter((file) => /Bubble/.test(file)), []);
});

test('the composer has separate typed events and no generic send event', async () => {
  const composer = await read('packages/vue/src/components/CEMessageComposer.vue');
  assert.match(composer, /submitReply: \[text: string\]; saveNote: \[text: string\]/);
  assert.doesNotMatch(composer, /emit\('(send|submit|message)'/);
  assert.match(composer, /event\.ctrlKey \|\| event\.metaKey/);
});

// The messaging components and the example only draw and update in-memory state. Transport, persistence, device access and
// providers belong to the application, so none of them may appear in this code.
test('the messaging components and the example add no network, transport, storage or provider code', async () => {
  const sources = [
    ...await files('packages/vue/src/', /\.(vue|ts)$/),
    'site/components/MessagingDemo.vue', 'site/data/messaging.ts', 'site/pages/mensajeria.astro',
  ];
  const forbidden = [
    [/\bfetch\s*\(/, 'fetch'], [/XMLHttpRequest/, 'XMLHttpRequest'], [/\bWebSocket\b/, 'WebSocket'], [/\bEventSource\b/, 'EventSource'],
    [/sendBeacon/, 'sendBeacon'], [/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|document\.cookie/, 'browser storage'],
    [/navigator\.(mediaDevices|serviceWorker|clipboard|geolocation)/, 'device access'], [/Notification\.requestPermission|RTCPeerConnection/, 'notifications or calls'],
    [/from 'https?:|import\(['"`]https?:|axios|socket\.io|firebase|twilio/i, 'client library'],
  ];
  assert.ok(sources.length >= 8);
  for (const file of sources) {
    const text = await read(file);
    for (const [pattern, name] of forbidden) assert.doesNotMatch(text, pattern, `${file} uses ${name}`);
  }
  for (const file of ['site/components/MessagingDemo.vue', 'site/data/messaging.ts', 'site/pages/mensajeria.astro']) {
    assert.doesNotMatch(await read(file), /whatsapp|instagram|messenger|telegram|facebook|\bSMS\b/i, `${file} names a provider`);
  }
});

test('the example fixtures are fictional: no catalogue codes, prices, stock or real domains', async () => {
  const fixtures = await read('site/data/messaging.ts');
  const data = fixtures.replace(/^\s*\/\/.*$/gm, ''); // the header comment says what the fixtures leave out
  assert.doesNotMatch(data, /\bCE\d{8,}\b|S\/\s?\d|stock|existencias|disponible/i);
  assert.doesNotMatch(data, /https?:\/\/(?!ejemplo\.invalido)/);
  assert.match(data, /Simulación: ningún mensaje sale de esta página\./);
});

test('the file enumeration helper returns repository-relative paths with "/" that git lists and that exist', async () => {
  const listed = new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: fileURLToPath(root), encoding: 'utf8' }).split('\n').filter(Boolean));
  const found = await files('packages/vue/src/', /\.(vue|ts)$/);
  assert.ok(found.includes('packages/vue/src/components/CEMessageList.vue'));
  assert.ok(found.includes('packages/vue/src/index.ts'));
  for (const file of found) {
    assert.ok(!file.includes('\\') && !file.startsWith('/') && !/^[A-Za-z]:/.test(file), `${file} is repository-relative with "/"`);
    assert.ok(listed.has(file), `${file} is a path git knows`);
    assert.ok((await read(file)).length > 0, `${file} can be read`);
  }
});

// This checks the path logic with the Windows separator. It does not run on Windows, so it does not show that the whole suite passes there.
test('converting a Windows-style relative path gives the repository path, with no characters dropped', () => {
  const entry = win32.join('components', 'CEButton.vue');
  assert.equal(entry, 'components\\CEButton.vue');
  assert.equal(toPosix(`packages/vue/src/${entry}`, win32.sep), 'packages/vue/src/components/CEButton.vue');
  assert.equal(toPosix('a/b/c.vue', '/'), 'a/b/c.vue');
});

test('every example conversation starts with the same separator id, so the list must be keyed by conversation', async () => {
  const fixtures = await read('site/data/messaging.ts');
  assert.equal(fixtures.match(/\{ id: 'day-1', kind: 'system'/g)?.length, 3);
  assert.match(await read('site/components/MessagingDemo.vue'), /<CEMessageList :key="current\.id"/);
  assert.match(await read('packages/vue/src/components/CEMessageList.vue'), /Mount one list per conversation and key it by the conversation id/);
});

test('the docs keep the general no-new-showcase-pages rule, name the one /mensajeria/ exception, and state CE Systems as planned', async () => {
  const decisions = await read('docs/decisions.md');
  const row = (topic) => decisions.split('\n').find((line) => line.includes(`| ${topic} |`)) ?? '';
  const exception = row('Showcase exception');
  assert.match(exception, /`\/mensajeria\/`/);
  assert.match(exception, /general restriction stays/);
  for (const file of ['docs/workflow.md', 'packages/vue/CONTRIBUTING.md']) {
    const text = await read(file);
    assert.match(text, /does not add showcase pages/, `${file} keeps the general rule`);
    assert.match(text, /`\/mensajeria\/`/, `${file} names the exception`);
    assert.match(text, /Showcase exception/, `${file} points at the decision`);
  }
  const systems = row('CE Systems');
  assert.match(systems, /\*\*Planned:\*\*/);
  assert.match(systems, /old2\.casaelida\.com/);
  assert.match(systems, /Neither operation is verified as completed/);
  assert.match(row('Application identities'), /CE Systems \(planned new `j3w1\/casaelida\.com`\)/);
  assert.match(row('Application identities'), /CE Meta App \(planned `j3w1\/ce-meta-app`\)/);
  // No document claims that the rebuild or the retirement has already happened.
  for (const file of ['docs/evolution/2026-10-reconciliation.md', 'docs/usage.md', 'docs/decisions.md']) assert.doesNotMatch(await read(file), /CE Systems is now rebuilt|retired CE Systems|existing repository is retired as/, file);
});
