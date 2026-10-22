import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readSources, resolveTokens, contrast } from '../scripts/tokens.mjs';

test('semantic roles resolve to selected brand colors and accessible pairs', async () => {
  const {manifest,tokens}=await readSources();
  assert.equal(tokens['color.brand.red'].css,'#e6303d');
  assert.equal(tokens['color.brand.yellow'].css,'#f9eb10');
  for (const [fg,bg,minimum] of manifest.contrastPairs) assert.ok(contrast(tokens[fg].value,tokens[bg].value)>=minimum,`${fg} / ${bg}`);
});
test('aliases resolve across files independent of file order', () => {
  const alias={a:{$type:'dimension',$value:'{b}'}};
  const base={b:{$type:'dimension',$value:{value:16,unit:'px'}}};
  assert.deepEqual(resolveTokens([alias,base]),resolveTokens([base,alias]));
  assert.equal(resolveTokens([alias,base]).a.css,'16px');
});
test('cycles, missing aliases, duplicate paths, name collisions and type changes fail clearly', () => {
  assert.throws(()=>resolveTokens([{a:{$type:'number',$value:'{b}'},b:{$type:'number',$value:'{a}'}}]),/Circular/);
  assert.throws(()=>resolveTokens([{a:{$type:'number',$value:'{missing}'}}]),/Unknown/);
  assert.throws(()=>resolveTokens([{a:{$type:'number',$value:1}},{a:{$type:'number',$value:2}}]),/Duplicate/);
  assert.throws(()=>resolveTokens([{'a-b':{$type:'number',$value:1},a:{b:{$type:'number',$value:2}}}]),/collision/);
  assert.throws(()=>resolveTokens([{a:{$type:'number',$value:'{b}'},b:{$type:'fontWeight',$value:700}}]),/type mismatch/);
});
test('generated public downloads exactly match the consumer exports', async () => {
  for (const file of ['tokens.css','tokens.resolved.json','recipes.css']) {
    assert.deepEqual(await readFile(new URL(`../exports/${file}`,import.meta.url)),await readFile(new URL(`../public/downloads/${file}`,import.meta.url)));
  }
});
