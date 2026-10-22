import { readFile } from 'node:fs/promises';

export async function readSources() {
  const manifest = JSON.parse(await readFile(new URL('../ce-theme.json', import.meta.url), 'utf8'));
  const sources = await Promise.all(manifest.tokenSources.map(async (path) =>
    JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'))));
  return { manifest, tokens: resolveTokens(sources) };
}

export function resolveTokens(sources) {
  const raw = new Map();
  function walk(group, prefix = '', inheritedType) {
    for (const [name, value] of Object.entries(group)) {
      if (name.startsWith('$')) continue;
      if (!value || typeof value !== 'object') throw new Error(`Invalid token group: ${prefix}${name}`);
      const path = prefix ? `${prefix}.${name}` : name;
      const type = value.$type ?? group.$type ?? inheritedType;
      if ('$value' in value) {
        if (raw.has(path)) throw new Error(`Duplicate token: ${path}`);
        if (!type) throw new Error(`Missing token type: ${path}`);
        raw.set(path, { type, value: value.$value, description: value.$description ?? '' });
      } else walk(value, path, type);
    }
  }
  sources.forEach((source) => walk(source));
  const resolved = new Map();
  function resolve(name, trail = []) {
    if (trail.includes(name)) throw new Error(`Circular reference: ${[...trail, name].join(' -> ')}`);
    if (resolved.has(name)) return resolved.get(name);
    const token = raw.get(name);
    if (!token) throw new Error(`Unknown token: ${name}`);
    function expand(value) {
      if (typeof value === 'string' && /^\{[^{}]+\}$/.test(value)) {
        const target = resolve(value.slice(1, -1), [...trail, name]);
        return structuredClone(target.value);
      }
      if (Array.isArray(value)) return value.map(expand);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, expand(v)]));
      return value;
    }
    if (typeof token.value === 'string' && /^\{[^{}]+\}$/.test(token.value)) {
      const target = resolve(token.value.slice(1, -1), [...trail, name]);
      if (target.type !== token.type) throw new Error(`Alias type mismatch: ${name}`);
    }
    const result = { ...token, value: expand(token.value) };
    validateValue(name, result);
    resolved.set(name, result);
    return result;
  }
  [...raw.keys()].forEach((name) => resolve(name));
  const cssNames = new Set();
  return Object.fromEntries([...resolved.entries()].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([name, token]) => {
    const variable = cssName(name);
    if (cssNames.has(variable)) throw new Error(`CSS name collision: ${name}`);
    cssNames.add(variable);
    return [name, { ...token, css: cssValue(token), variable }];
  }));
}

export const cssName = (name) => `--ce-${name.replaceAll('.', '-')}`;

function validateValue(name, { type, value }) {
  let valid = false;
  if (type === 'color') valid = value?.colorSpace === 'srgb' && value.components?.length === 3 &&
    value.components.every((n) => Number.isFinite(n) && n >= 0 && n <= 1) &&
    (value.alpha === undefined || (Number.isFinite(value.alpha) && value.alpha >= 0 && value.alpha <= 1));
  if (type === 'dimension') valid = Number.isFinite(value?.value) && ['px', 'rem'].includes(value?.unit);
  if (type === 'duration') valid = Number.isFinite(value?.value) && value.value >= 0 && ['ms', 's'].includes(value.unit);
  if (type === 'number' || type === 'fontWeight') valid = Number.isFinite(value);
  if (type === 'fontFamily') valid = (typeof value === 'string' && value.length > 0) || (Array.isArray(value) && value.every((v) => typeof v === 'string' && v.length));
  if (!valid) throw new Error(`Invalid ${type} value: ${name}`);
}

export function cssValue({ type, value }) {
  if (type === 'color') {
    if (value.alpha !== undefined && value.alpha < 1) return `rgb(${value.components.map((n) => Math.round(n * 255)).join(' ')} / ${value.alpha})`;
    return `#${value.components.map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('')}`;
  }
  if (type === 'dimension' || type === 'duration') return `${value.value}${value.unit}`;
  if (type === 'fontFamily') return (Array.isArray(value) ? value : [value]).map((v) => v.includes(' ') ? `"${v}"` : v).join(', ');
  return String(value);
}

export function contrast(a, b) {
  const luminance = ({ components }) => components.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
