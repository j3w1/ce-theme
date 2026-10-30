import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { NAMES } from '../recipes/names.mjs';
import { RECIPE_SOURCES } from '../scripts/sources.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const TITLE = 'CE Theme — Design System';

async function files(folder, pattern) {
  const out = [];
  for (const entry of await readdir(new URL(folder, root), { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && pattern.test(entry.name)) out.push(`${folder}${entry.parentPath.slice(new URL(folder, root).pathname.length)}${entry.parentPath.endsWith('/') ? '' : '/'}${entry.name}`.replace(/\/\//g, '/'));
  }
  return out;
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
  for (const folder of folders) for (const file of await readdir(new URL(folder, root), { recursive: true })) if (/\.(md|mjs|astro|vue|ts|css)$/.test(file)) candidates.push(folder + file);
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
