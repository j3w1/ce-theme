/** Casa Elida product-information presentation. Display only: originals are never rewritten,
 * nothing is inferred, and missing optional fields stay missing. */

const CONNECTORS = new Set(['a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'entre', 'la', 'las', 'lo', 'los', 'o', 'para', 'por', 'sin', 'sobre', 'u', 'un', 'una', 'y']);
const isUpper = (word) => /\p{Lu}/u.test(word) && word === word.toLocaleUpperCase('es-PE');
const startsWithDigit = (word) => /^\d/.test(word);

/** Product NAME: the uppercase catalogue name or model (`WILUL`, `BALTEL STORM`). */
export function formatName(name) {
  if (name === undefined || name === null) return undefined;
  if (typeof name !== 'string') throw new TypeError('NAME must be text.');
  const text = name.trim().replace(/\s+/g, ' ');
  return text ? text.toLocaleUpperCase('es-PE') : undefined;
}

/** Description in Title Case with Spanish connectors in lowercase: `Frasco con Cucharita`.
 * Abbreviations already in capitals (PU, LED) and tokens that start with a digit (250ml) are kept. */
export function formatDescription(description) {
  if (description === undefined || description === null) return undefined;
  if (typeof description !== 'string') throw new TypeError('Description must be text.');
  const text = description.trim().replace(/\s+/g, ' ');
  if (!text) return undefined;
  const shouting = isUpper(text.replace(/[^\p{L}]/gu, '')) && /\p{L}{4,}/u.test(text);
  return text.split(' ').map((word, index) => {
    if (startsWithDigit(word)) return word;
    if (!shouting && isUpper(word) && word.length > 1) return word;
    if (!shouting && /\p{Ll}\p{Lu}/u.test(word)) return word;
    const lower = word.toLocaleLowerCase('es-PE');
    if (index > 0 && CONNECTORS.has(lower)) return lower;
    return lower.replace(/^(\P{L}*)(\p{L})/u, (_, lead, first) => lead + first.toLocaleUpperCase('es-PE'));
  }).join(' ');
}

const METRIC_UNITS = /(\d)(CM|MM|ML|KG)\b/g;

/** Segments a Casa Elida code for the on-screen reading aid: CE+YYMM, the four-digit group and item
 * number, and the variant/size ending (kept whole; its boundary is never inferred). Joining the
 * segments returns the exact code; anything that does not match is returned as one segment. */
export function codeSegments(code) {
  if (typeof code !== 'string' || !code) throw new TypeError('Codes are non-empty strings, never numbers.');
  const match = /^(CE\d{4})(\d{4})([A-Z0-9]*)$/.exec(code);
  if (!match) return [{ text: code, part: 'whole' }];
  return [{ text: match[1], part: 'period' }, { text: match[2], part: 'number' }, ...(match[3] ? [{ text: match[3], part: 'ending' }] : [])];
}

/** Specifications in lowercase, keeping abbreviations (PU, PVC), mixed-case designations and
 * any value listed in `preserve` exactly as supplied. Only CM, MM, ML and KG directly after a digit are
 * normalized to their lowercase symbols; other source case (L, M, sizes) is kept. */
export function formatSpec(spec, { preserve = [] } = {}) {
  if (spec === undefined || spec === null) return undefined;
  if (typeof spec !== 'string') throw new TypeError('Specification must be text.');
  const text = spec.trim().replace(/\s+/g, ' ');
  if (!text) return undefined;
  if (preserve.includes(text)) return text;
  return text.replace(METRIC_UNITS, (_, digit, unit) => digit + unit.toLowerCase()).split(/(\s+|\/|,)/).map((part) => {
    if (!/\p{L}/u.test(part) || preserve.includes(part)) return part;
    if (startsWithDigit(part) || isUpper(part)) return part;
    if (/\p{Ll}\p{Lu}/u.test(part)) return part;
    return part.toLocaleLowerCase('es-PE');
  }).join('');
}

/** Builds the display view used by every surface. `record` fields are supplied data:
 * { name, description, specs: [], code, image, imageAlt }. Price is formatted separately by price.mjs. */
export function productView(record, { maxSpecs = Infinity, preserve = [] } = {}) {
  if (!record || typeof record !== 'object') throw new TypeError('Product record required.');
  const name = formatName(record.name);
  const description = formatDescription(record.description);
  if (!name && !description) throw new TypeError('A product needs a NAME or a Description.');
  if (record.code !== undefined && (typeof record.code !== 'string' || !record.code.trim())) {
    throw new TypeError('Codes are non-empty strings, never numbers.');
  }
  const specs = (record.specs ?? []).map((spec) => formatSpec(spec, { preserve })).filter(Boolean).slice(0, maxSpecs);
  return {
    name, description, specs,
    code: record.code,
    image: record.image || undefined,
    imageAlt: record.imageAlt ?? [description, name].filter(Boolean).join(' '),
    accessibleName: [name, description].filter(Boolean).join(', '),
  };
}
