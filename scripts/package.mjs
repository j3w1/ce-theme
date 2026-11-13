// The foundation entry of @casaelida/vue, assembled from the canonical tokens/, recipes/ and fonts/ sources:
// styles.css (Inter @font-face, tokens and recipes) with the Inter files and their licence beside it.
// `node scripts/package.mjs` writes it into packages/vue/dist/ (the package build runs it); the consumer proof
// compares the packed copy with packageFiles(), so a tarball can never ship CSS that differs from its source.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readSources, tokensCss } from './tokens.mjs';
import { readRecipes } from './sources.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));

export async function packageFiles() {
  const { manifest, tokens } = await readSources();
  const fonts = JSON.parse(await read('fonts/manifest.json'));
  // recipes/fonts.css points at ../fonts/inter/; inside the package the files sit in fonts/ next to styles.css.
  const faces = (await read('recipes/fonts.css')).toString().replace(/^\/\*[\s\S]*?\*\/\n/, '').replaceAll('url("../fonts/inter/', 'url("./fonts/');
  for (const font of fonts) {
    const name = font.file.split('/').pop();
    if (faces.split(`url("./fonts/${name}")`).length !== 2) throw new Error(`recipes/fonts.css must load ${name} exactly once`);
  }
  if (/url\("(?!\.\/fonts\/)/.test(faces)) throw new Error('A font URL in recipes/fonts.css leaves the package.');
  const css = `/* @casaelida/vue styles: Inter, the Casa Elida tokens and recipes, generated from tokens/, recipes/ and fonts/. Do not edit.
   Inter 3.015 is licensed under the SIL Open Font License 1.1 (fonts/OFL.txt). Import once; wrap the application region in .ce-scope. */
${faces}${tokensCss(manifest, tokens)}${await readRecipes()}`;
  return new Map([
    ['styles.css', css],
    ...await Promise.all(fonts.map(async (font) => [`fonts/${font.file.split('/').pop()}`, await read(`fonts/${font.file}`)])),
    ['fonts/OFL.txt', await read('fonts/inter/OFL.txt')],
  ]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = new URL('packages/vue/dist/', root);
  const files = await packageFiles();
  for (const [path, content] of files) {
    await mkdir(new URL('.', new URL(path, dist)), { recursive: true });
    await writeFile(new URL(path, dist), content);
  }
  console.log(`Wrote ${files.size} foundation files into packages/vue/dist/.`);
}
