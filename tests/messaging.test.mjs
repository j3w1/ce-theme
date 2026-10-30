import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NAMES, NAME_GROUPS } from '../recipes/names.mjs';
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

test('the attachment group and the work status are public, named components with recipes, and add no CSS of their own', async () => {
  for (const [id, vue, es] of [['AttachmentGroup', 'CEAttachmentGroup', 'Grupo de adjuntos'], ['WorkStatus', 'CEWorkStatus', 'Estado del trabajo']]) {
    const entry = NAMES.find((item) => item.id === id);
    assert.ok(entry, `${id} is registered`);
    assert.equal(entry.vue, vue);
    assert.equal(entry.group, 'Mensajería');
    assert.equal(entry.es, es);
    assert.ok(entry.sample.length > 0 && entry.rule.length > 0);
    assert.doesNotMatch(entry.sample, /<script|onclick|javascript:/i);
    assert.ok((await read('packages/vue/src/index.ts')).includes(`default as ${vue} } from './components/${vue}.vue'`));
    const component = await read(`packages/vue/src/components/${vue}.vue`);
    assert.doesNotMatch(component, /<style|\sstyle=|:style=|v-bind\(/, `${vue} adds no CSS or inline style`);
    assert.match(await read(`packages/vue/test/${vue}.test.ts`), /describe\(/);
  }
  // Every class that the registry lists for these names is defined by the recipes, and the samples use only listed classes.
  const css = await read('exports/recipes.css');
  for (const id of ['AttachmentGroup', 'WorkStatus']) {
    const entry = NAMES.find((item) => item.id === id);
    for (const name of entry.recipe) assert.ok(css.includes(`.${name}`), `${name} is defined in exports/recipes.css`);
    const used = new Set(entry.sample.match(/\bce-[a-z0-9-]+/g));
    for (const name of used) assert.ok(entry.recipe.includes(name) || name === 'ce-sr-only', `${id} sample uses unlisted ${name}`);
  }
});

test('the attachment group keeps its tile boxes reserved, uncropped by default and responsive; the work status never relies on colour alone', async () => {
  const css = await read('recipes/messaging.css');
  assert.match(css, /\.ce-attachment \{[^}]*aspect-ratio: 2 \/ 3/);
  assert.match(css, /\.ce-attachments--1 \.ce-attachment \{[^}]*aspect-ratio: 4 \/ 3/);
  assert.match(css, /\.ce-attachment-image \{[^}]*object-fit: contain/);
  assert.match(css, /\.ce-attachments--cover \.ce-attachment-image \{[^}]*object-fit: cover/);
  assert.match(css, /\.ce-attachments--1 \{[^}]*minmax\(0, 1fr\)/);
  assert.match(css, /\.ce-attachments--2, \.ce-attachments--4 \{[^}]*repeat\(2/);
  assert.match(css, /@container \(max-width: 21rem\)/);
  assert.match(css, /\.ce-message-list \{[^}]*container-type: inline-size/);
  // Done, current, pending and stopped each differ by bar shape, and stopped uses a hatch pattern, not only a colour.
  for (const state of ['done', 'current', 'pending', 'stopped']) assert.match(css, new RegExp(`\\.ce-work-step--${state}\\b`));
  assert.match(css, /\.ce-work-step--stopped::before \{[^}]*repeating-linear-gradient\(135deg/);
  assert.match(css, /\.ce-work-step--current::before \{[^}]*background-size: 100% 8px/);
  assert.match(css, /\.ce-focus|\.ce-attachment-open:focus-visible \{[^}]*var\(--ce-stroke-focus\)[^}]*var\(--ce-color-focus\)/);
});

test('the generated files carry the new recipes, names and the corrected design-system README', async () => {
  for (const file of ['exports/recipes.css', 'public/downloads/recipes.css', 'exports/design-system/project/components/bundle.css']) {
    const css = await read(file);
    for (const name of ['.ce-attachments', '.ce-attachment-open', '.ce-work-status', '.ce-work-step--stopped', '.ce-message-context']) assert.ok(css.includes(name), `${file} has ${name}`);
  }
  for (const file of ['docs/names.md', 'public/downloads/names.md', 'exports/design-system/project/names.md']) {
    const names = await read(file);
    assert.match(names, /`AttachmentGroup` \| Grupo de adjuntos \|/, file);
    assert.match(names, /`WorkStatus` \| Estado del trabajo \|/, file);
  }
  assert.ok((await read('public/downloads/names.mjs')).includes("id: 'WorkStatus'"));
  const card = await read('exports/design-system/project/components/StandardNamesMessaging/preview.html');
  assert.ok(card.includes('ce-attachments') && card.includes('ce-work-status'));
  assert.ok((await read('exports/design-system/project/components/StandardNamesMessaging/README.md')).includes('**WorkStatus** · Estado del trabajo'));
});

test('design-system/README.md matches the approved price rule, the ten standard-name cards and the real card inventory', async () => {
  const readme = await read('design-system/README.md');
  assert.doesNotMatch(readme, /Prices align to the bottom/i);
  assert.match(readme, /The price follows the specifications at the approved 12px gap \(`size\.product\.gap-price`\) and is never pushed to the bottom of the card/);
  assert.match(await read('docs/names.md'), /Specs and the price \| `size\.product\.gap-price` \| 12px/);
  assert.ok(NAME_GROUPS.length === 10 && NAME_GROUPS.some((group) => group.es === 'Mensajería'));
  assert.match(readme, /\*\*Standard names:\*\* ten cards, one per group of names \(including Messaging\)/);
  assert.doesNotMatch(readme, /nine cards/i);
  for (const group of NAME_GROUPS) assert.ok(readme.includes(`\`${group.card}\``), `${group.card} is listed`);
  // The Components listing names every real card folder, including Controls, and Cover stays the system cover card.
  const listing = readme.slice(readme.indexOf('## Components'));
  const folders = (await readdir(new URL('design-system/components/', root), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const folder of folders.filter((name) => name !== 'Cover')) assert.ok(listing.includes(`\`${folder}\``), `Components lists ${folder}`);
  assert.match(listing, /\*\*Forms:\*\* `Field`, `FormControls`, `Controls`, `Swatch`/);
  assert.match(listing, /\*\*Cover:\*\* the system cover card\./);
  assert.ok(folders.includes('Controls') && folders.includes('Cover'));
});

test('the shelf illustration is a self-contained fictional SVG with recorded provenance', async () => {
  const svg = await read('public/references/shelf-gap-fictional.svg');
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 640 480"/);
  assert.doesNotMatch(svg, /<script|<image|<foreignObject|<style|<link|\bhref=|xlink:|url\(|@import|data:|on\w+=|<use/i);
  assert.doesNotMatch(svg, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
  assert.match(svg, /<title>.+<\/title>/);
  assert.match(svg, /Frasco de vidrio 1 L/);
  const entry = JSON.parse(await read('public/references/manifest.json')).find((item) => item.file === 'shelf-gap-fictional.svg');
  assert.ok(entry, 'the manifest records the illustration');
  assert.equal(entry.role, 'reference');
  assert.equal(entry.originalName, 'shelf-gap-fictional.svg');
  assert.match(entry.source, /ce-theme#3 on 2026-10-30/);
  assert.match(entry.source, /not derived from any photograph|Not derived from any photograph/);
  assert.match(entry.source, /private Claude Design photo/);
  for (const field of ['description', 'rights', 'sha256']) assert.ok(entry[field], field);
  assert.equal(entry.sha256, createHash('sha256').update(svg).digest('hex'));
  // The example uses this file and no other image.
  const fixtures = await read('site/data/messaging.ts');
  assert.match(fixtures, /SHELF_PHOTO = '\/references\/shelf-gap-fictional\.svg'/);
  assert.doesNotMatch(fixtures, /PRIVATE-DESIGN-ASSET|\.(png|jpe?g|webp)\b/i);
});

test('the Reposición example keeps delivery status and work progress apart, with simulated actions and no viewer', async () => {
  const demo = await read('site/components/MessagingDemo.vue');
  const fixtures = await read('site/data/messaging.ts');
  assert.match(fixtures, /name: 'Reposición · Tacna', kind: 'team'/);
  assert.match(fixtures, /Se acabaron los frascos de 1 L en el anaquel 3\./);
  assert.match(fixtures, /'¿Algo más para reponer hoy\?'/);
  for (const label of ['Me encargo', 'Empezar a preparar', 'Marcar resuelto', 'No se puede atender']) assert.ok(fixtures.includes(label), label);
  assert.match(demo, /<template #context=/);
  assert.match(demo, /@open-attachment="onOpenAttachment"/);
  assert.match(demo, /Acciones simuladas del almacén/);
  assert.match(demo, /No hay visor en esta demostración/);
  assert.doesNotMatch(demo, /<dialog|role="dialog"|CEModal|window\.open/);
  // The delivery status is a field of the message; the request state is a separate structure.
  assert.match(fixtures, /requests: \{ m03: \{ state: 'requested' \} \}/);
  assert.match(fixtures, /status: 'read', simulated: true,\s+attachments:/);
  assert.match(fixtures, /The states are illustrative|Illustrative states|illustrative/i);
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
  assert.equal(fixtures.match(/\{ id: 'day-1', kind: 'system'/g)?.length, 4);
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
