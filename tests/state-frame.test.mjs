import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { readSources, contrast } from '../scripts/tokens.mjs';
import { readRecipes, RECIPE_SOURCES } from '../scripts/sources.mjs';
import { packageFiles } from '../scripts/package.mjs';
import { NAMES } from '../recipes/names.mjs';

// CR-02: the StateFrame documentation kit. It is a stylesheet beside the design-system sources, loaded after the bundle,
// built from tokens only, styling only its own classes, and never part of the recipes, the Vue package or the registry.
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const KIT = 'design-system/doc-kit/state-frame.css';
const CANON = 'Demostración — datos y operaciones simulados';
const EXEMPT = 'Exempt from the demonstration cue (no simulated data):';
const OWN = /^ce-state-frame(?:-[a-z]+)?(?:--[a-z]+)?$/;
const PLACED = ['ce-demo-cue', 'ce-badge'];

// The kit's rules as { media, selector, declarations }; media is the query of the enclosing @media block or null.
function rules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const parse = (block, media) => {
    for (const [, selector, body] of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const declarations = body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
        const at = d.indexOf(':');
        return { property: d.slice(0, at).trim(), value: d.slice(at + 1).trim() };
      });
      out.push({ media, selector: selector.trim(), declarations });
    }
  };
  const rest = text.replace(/@media\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g, (_, query, block) => { parse(block, query.trim()); return ''; });
  assert.doesNotMatch(rest, /@/, 'no at-rule other than @media');
  parse(rest, null);
  return out;
}

test('the kit is one stylesheet with a readme beside the design-system sources, shipped unchanged in the design-system bundle', async () => {
  assert.deepEqual((await readdir(new URL('design-system/doc-kit/', root))).sort(), ['README.md', 'state-frame.css']);
  for (const file of ['state-frame.css', 'README.md']) {
    assert.equal(await read(`exports/design-system/project/doc-kit/${file}`), await read(`design-system/doc-kit/${file}`), file);
  }
  assert.ok((await read('design-system/doc-kit/README.md')).startsWith('# StateFrame documentation kit\n'));
});

test('the kit holds no raw colour and no raw size in a declaration: tokens and keywords only, and only the bundle breakpoint', async () => {
  const { tokens } = await readSources();
  const variables = new Set(Object.values(tokens).map((token) => token.variable));
  const css = await read(KIT);
  const all = rules(css);
  assert.ok(all.length >= 10);
  assert.doesNotMatch(css, /!important|@import|url\(/);
  for (const { media, selector, declarations } of all) {
    if (media !== null) assert.equal(media, '(max-width: 639.98px)', 'the one permitted query value');
    for (const { property, value } of declarations) {
      const where = `${selector} { ${property}: ${value} }`;
      assert.ok(!property.startsWith('--'), `${where}: the kit defines no custom property`);
      assert.ok(!['zoom', 'transform', 'scale', 'content', 'filter'].includes(property), `${where}: the kit never scales or writes text`);
      for (const [, variable] of value.matchAll(/var\((--ce-[\w-]+)\)/g)) assert.ok(variables.has(variable), `${where}: ${variable} is a token`);
      const rest = value.replace(/var\(--ce-[\w-]+\)/g, ' ').replace(/\s+/g, ' ').trim();
      assert.doesNotMatch(rest, /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i, `${where}: no raw colour`);
      assert.doesNotMatch(rest, /\d(?:px|r?em|%|v[hw]|vmin|vmax|ch|ex|pt|pc|cm|mm|in|q|fr)(?![\w-])/i, `${where}: no raw size`);
      // What is left is a CSS keyword, a zero, the grid lines of the wide frame, or the inward focus offset.
      assert.match(rest, /^(?:(?:grid|flow-root|relative|start|flex|flex-start|none|center|solid|middle|auto|0)(?: |$))*$|^1 \/ -1$|^calc\( \* -1\)$/, where);
    }
  }
  const bundle = await read('exports/design-system/project/components/bundle.css');
  assert.match(bundle, /@media [^{]*\(max-width: 639\.98px\)/, 'the breakpoint is the bundle\'s own');
  const marker = all.find((rule) => rule.selector === '.ce-state-frame-mark').declarations;
  assert.ok(marker.some(({ property, value }) => /width$/.test(property) && value === 'var(--ce-size-marker)'), 'the marker width uses size.marker');
  assert.ok(marker.some(({ property, value }) => property === 'height' && value === 'var(--ce-size-marker)'), 'the marker height is size.marker');
  // A wide fragment scrolls inside the body (overflow-x: auto), and the positioned body contains its absolute boxes; a focused body shows the focus stroke inside its edge.
  const body = all.find((rule) => rule.selector === '.ce-state-frame-body' && rule.media === null).declarations;
  assert.ok(body.some(({ property, value }) => property === 'display' && value === 'flow-root'), 'the body is block flow');
  assert.ok(body.some(({ property, value }) => property === 'overflow-x' && value === 'auto'), 'a wide fragment scrolls inside the body');
  assert.deepEqual(all.find((rule) => rule.selector === '.ce-state-frame-body:focus-visible').declarations, [
    { property: 'outline', value: 'var(--ce-stroke-focus) solid var(--ce-color-focus)' },
    { property: 'outline-offset', value: 'calc(var(--ce-stroke-focus) * -1)' },
  ]);
  const band = all.find((rule) => rule.selector === '.ce-state-frame--band > .ce-state-frame-label').declarations;
  assert.deepEqual(band, [{ property: 'border-top', value: 'var(--ce-stroke-heavy) solid var(--ce-color-surface-inverse)' }], 'the band rule is stroke.heavy');
});

test('the readme lists exactly the tokens the stylesheet reads', async () => {
  const used = new Set([...(await read(KIT)).matchAll(/var\((--ce-[\w-]+)\)/g)].map(([, name]) => name));
  const section = (await read('design-system/doc-kit/README.md')).split('## Tokens it uses')[1].split('\n## ')[0];
  assert.deepEqual(new Set([...section.matchAll(/`(--ce-[\w-]+)`/g)].map(([, name]) => name)), used);
});

test('every kit selector starts from a kit class and reaches only kit classes, .ce-demo-cue and .ce-badge', async () => {
  for (const { selector } of rules(await read(KIT))) {
    for (const part of selector.split(',').map((s) => s.trim())) {
      const classes = [...part.matchAll(/\.([\w-]+)/g)].map(([, name]) => name);
      assert.ok(OWN.test(classes[0] ?? '') && part.startsWith(`.${classes[0]}`), `${part}: starts from a kit class`);
      for (const name of classes) assert.ok(OWN.test(name) || PLACED.includes(name), `${part}: .${name} is not the kit's`);
      // The one pseudo-class is the focus ring of a scrolling body.
      const plain = part === '.ce-state-frame-body:focus-visible' ? '.ce-state-frame-body' : part;
      assert.doesNotMatch(plain, /[#*:[]|^(?:html|body)\b/, `${part}: no id, universal, pseudo-class or attribute selector`);
    }
  }
});

test('the kit stays downstream: the bundle, the recipes, the Vue package and the registry never carry it', async () => {
  assert.ok(!RECIPE_SOURCES.some((path) => path.includes('doc-kit')));
  const shipped = {
    'recipes sources': await readRecipes(),
    'exports/recipes.css': await read('exports/recipes.css'),
    'public/downloads/recipes.css': await read('public/downloads/recipes.css'),
    'components/bundle.css': await read('exports/design-system/project/components/bundle.css'),
    '@casaelida/vue styles.css': (await packageFiles()).get('styles.css'),
  };
  for (const [name, css] of Object.entries(shipped)) assert.doesNotMatch(css, /ce-state-frame|doc-kit/, name);
  assert.ok(!NAMES.some((entry) => entry.id === 'StateFrame' || entry.recipe.some((cls) => cls.startsWith('ce-state-frame'))), 'no registry entry');
  assert.doesNotMatch(await read('recipes/names.mjs'), /StateFrame|state-frame/);
  assert.doesNotMatch(await read('docs/names.md'), /StateFrame|ce-state-frame/);
  const cards = await readdir(new URL('exports/design-system/project/components/', root));
  assert.ok(!cards.some((name) => /StateFrame|StateSheet/i.test(name)), 'no StateFrame card');
  assert.doesNotMatch(await read('exports/design-system/project/components/bundle.js'), /StateFrame/);
  for (const file of await readdir(new URL('packages/vue/src/', root), { recursive: true })) {
    if (/\.(vue|ts|css)$/.test(file)) assert.doesNotMatch(await read(`packages/vue/src/${file}`), /state-frame|StateFrame/i, file);
  }
});

test('the kit text pairs keep 4.5:1', async () => {
  const { tokens } = await readSources();
  for (const [fg, bg] of [['color.text.inverse', 'color.surface.inverse'], ['color.text.secondary', 'color.surface.subtle'], ['color.text.primary', 'color.surface.subtle']]) {
    assert.ok(contrast(tokens[fg].value, tokens[bg].value) >= 4.5, `${fg} on ${bg}`);
  }
});

// Every shipped frame: the markup the readme teaches and the synthetic sheet the browser test renders.
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter((file) => /\.(html|md)$/.test(file) && !file.startsWith('docs/change-requests/'));
const FRAME = /<(section|article|div)\b[^>]*\bclass="ce-state-frame(?: [^"]*)?"[^>]*>/g;
// Each frame's markup, from its opening tag to the first closing tag of the same element (frames hold no element of their own kind).
const framesOf = (text) => [...text.matchAll(FRAME)].map((start) => {
  const close = `</${start[1]}>`;
  const end = text.indexOf(close, start.index);
  assert.ok(end > 0, 'every frame is closed');
  return { start, frame: text.slice(start.index, end + close.length) };
});

test('every frame is named by its heading title, has a decorative one- or two-character marker and English label, and no inline style on its chrome', async () => {
  let frames = 0;
  for (const file of files) {
    const text = await read(file);
    framesOf(text).forEach(({ start, frame }, i) => {
      frames += 1;
      const where = `${file} frame ${i + 1}`;
      const id = start[0].match(/\baria-labelledby="([^"]+)"/)?.[1];
      assert.ok(id, `${where}: aria-labelledby`);
      assert.match(frame, new RegExp(`<(h[2-6]) class="ce-state-frame-title" id="${id}">[\\s\\S]+?</\\1>`), `${where}: the title is a heading and names the frame`);
      assert.match(frame, /<span class="ce-state-frame-mark" aria-hidden="true">[^<\s]{1,2}<\/span>/, `${where}: marker`);
      assert.match(frame, /<header class="ce-state-frame-label">\s*<span class="ce-state-frame-mark"[^>]*>[^<]*<\/span>\s*<div lang="en">/, `${where}: English label column`);
      for (const [badge] of frame.matchAll(/<span class="ce-badge"[^>]*>/g)) assert.match(badge, /lang="es"/, `${where}: Spanish badge`);
      // No inline style on the kit's own chrome; a fragment keeps the consumer inputs its recipes document (--ce-x, …).
      for (const [tag] of frame.matchAll(/<\w+\b[^>]*\bclass="[^"]*\bce-state-frame[\w-]*[^"]*"[^>]*>/g)) assert.doesNotMatch(tag, /\bstyle=/, `${where}: no inline style on ${tag}`);
      assert.doesNotMatch(frame, /\bstyle=""/, `${where}: no empty style attribute`);
      assert.doesNotMatch(frame, /ce-state-frame-(?:tag|mark--)/, `${where}: no tag modifier`);
      // A body made focusable for scrolling is a group named by the frame title, as the readme teaches.
      const body = frame.match(/<div class="ce-state-frame-body"([^>]*)>/)[1];
      if (body) assert.equal(body, ` tabindex="0" role="group" aria-labelledby="${id}"`, `${where}: a scrolling body is focusable and named by the title`);
    });
  }
  assert.ok(frames >= 10, `frames seen: ${frames}`);
});

test('every frame with simulated data has its own cue, first in its body, in the canon words; only named frames are exempt', async () => {
  const seen = new Map();
  for (const file of files) {
    const text = await read(file);
    const starts = framesOf(text);
    if (!starts.length) continue;
    // The named exemption: the sheet's notes list each exempt frame's title after the exemption sentence.
    const lists = [...text.matchAll(new RegExp(`<p>${EXEMPT.replace(/[()]/g, '\\$&')}</p>\\s*<ul>([\\s\\S]*?)</ul>`, 'g'))];
    const exempt = new Set(lists.flatMap(([, list]) => [...list.matchAll(/<li>([^<]+)<\/li>/g)].map(([, title]) => title.trim())));
    let cues = 0;
    starts.forEach(({ frame }) => {
      const title = frame.match(/class="ce-state-frame-title"[^>]*>([^<]+)/)[1].trim();
      const first = frame.split(/<div class="ce-state-frame-body"[^>]*>/)[1];
      assert.ok(first, `${file} ${title}: body`);
      const cue = first.match(/^\s*<p class=\"ce-demo-cue\" role="note">([^<]*)<\/p>/);
      if (cue) {
        assert.equal(cue[1], CANON, `${file} ${title}: canon wording`);
        cues += 1;
      } else {
        assert.ok(exempt.has(title), `${file} ${title}: no cue in its own body and not named in the notes as exempt`);
        assert.doesNotMatch(first, /ce-demo-cue/, `${file} ${title}: an exempt frame carries no cue elsewhere`);
      }
    });
    // A sheet's exemptions name its own frames; the readme's exemption snippet stands alone.
    if (file.endsWith('.html')) for (const title of exempt) assert.ok(starts.some(({ frame }) => frame.includes(`>${title}`)), `${file}: exemption ${title} names a frame`);
    seen.set(file, { frames: starts.length, cues, exempt: file.endsWith('.html') ? exempt.size : 0 });
  }
  assert.deepEqual(seen.get('tests/fixtures/state-frame-sheet.html'), { frames: 9, cues: 8, exempt: 1 });
  assert.deepEqual(seen.get('design-system/doc-kit/README.md'), { frames: 1, cues: 1, exempt: 0 });
});

test('sheets load the kit after tokens.css and components/bundle.css', async () => {
  for (const file of ['design-system/doc-kit/README.md', 'tests/fixtures/state-frame-sheet.html']) {
    const links = [...(await read(file)).matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(([, href]) => href);
    const at = (name) => links.findIndex((href) => href.endsWith(name));
    assert.ok(at('tokens.css') >= 0 && at('tokens.css') < at('components/bundle.css') && at('components/bundle.css') < at('doc-kit/state-frame.css'), `${file}: ${links.join(', ')}`);
    assert.equal(at('doc-kit/state-frame.css'), links.length - 1, `${file}: the kit loads last`);
  }
});
