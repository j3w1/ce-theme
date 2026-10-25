// Generated adapters for framework consumers. Narrow by design: they map ce-theme tokens into a
// framework's theme API and leave layout, components and behaviour to the application.

const hex = (tokens, path) => tokens[path].css;

export function vuetifyAdapter(manifest, tokens) {
  const theme = {
    dark: false,
    colors: {
      background: hex(tokens, 'color.surface.canvas'),
      surface: hex(tokens, 'color.surface.canvas'),
      'surface-variant': hex(tokens, 'color.surface.subtle'),
      'on-surface-variant': hex(tokens, 'color.text.primary'),
      primary: hex(tokens, 'color.action.primary.bg'),
      'on-primary': hex(tokens, 'color.action.primary.text'),
      secondary: hex(tokens, 'color.surface.inverse'),
      'on-secondary': hex(tokens, 'color.text.inverse'),
      error: hex(tokens, 'color.status.danger.text'),
      success: hex(tokens, 'color.status.success.text'),
      warning: hex(tokens, 'color.status.warning.text'),
      info: hex(tokens, 'color.status.info.text'),
      'ce-brand-red': hex(tokens, 'color.brand.red'),
      'ce-brand-yellow': hex(tokens, 'color.brand.yellow'),
      'ce-offer': hex(tokens, 'color.price.offer.bg'),
    },
    variables: {
      'border-color': hex(tokens, 'color.border.control'),
      'border-opacity': 1,
      'high-emphasis-opacity': 1,
      'medium-emphasis-opacity': 0.72,
      'font-family': tokens['font.family'].css,
    },
  };
  const defaults = {
    global: { ripple: false },
    VBtn: { rounded: 'pill', variant: 'flat', class: 'text-none' },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'sm' },
    VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'sm' },
    VAutocomplete: { variant: 'outlined', density: 'comfortable', rounded: 'sm' },
    VChip: { rounded: 'pill' },
    VCard: { rounded: 0, elevation: 0, border: true },
    VDataTable: { density: 'compact', hover: true },
  };
  return `// Casa Elida ${manifest.version} — Vuetify adapter generated from tokens/. Do not edit.
// Usage: createVuetify({ theme: { defaultTheme: 'casaElida', themes: { casaElida } }, defaults })
// Load exports/fonts.css and exports/tokens.css too: product, price, code and tagging recipes are CSS classes.
export const casaElida = ${JSON.stringify(theme, null, 2)};

export const defaults = ${JSON.stringify(defaults, null, 2)};
`;
}

// CE Radio adapter: the player's existing --station-* variables, filled from the radio tokens, so CE Radio can
// adopt the theme by replacing the :root block of src/renderer/styles/tokens.css with this file. Colour values only;
// CE Radio keeps its own layout, components and behaviour. Admin keeps its own theme (owner decision, 2026-10-12).
export function ceRadioAdapter(manifest, tokens) {
  const c = (path) => tokens[path].css;
  const soft = (path, alpha) => {
    const [r, g, b] = tokens[path].css.slice(1).match(/../g).map((part) => parseInt(part, 16));
    return `rgb(${r} ${g} ${b} / ${alpha}%)`;
  };
  return [
    `/* Casa Elida ${manifest.version} — CE Radio station adapter, generated from tokens/ by scripts/adapters.mjs. Do not edit. */`,
    ':root {',
    `  --station-bg: ${c('color.radio.bg')};`,
    `  --station-chrome: ${c('color.radio.chrome')};`,
    `  --station-surface: ${c('color.radio.surface')};`,
    `  --station-raised: ${c('color.radio.raised')};`,
    `  --station-line: ${c('color.radio.line')};`,
    `  --station-control: ${c('color.radio.control')};`,
    `  --station-text: ${c('color.radio.text')};`,
    `  --station-muted: ${c('color.radio.muted')};`,
    `  --station-faint: ${c('color.radio.faint')};`,
    `  --station-yellow: ${c('color.radio.signal')};`,
    `  --station-yellow-soft: ${soft('color.radio.signal', 14)};`,
    `  --station-red: ${c('color.radio.alert')};`,
    `  --station-red-soft: ${soft('color.radio.alert', 18)};`,
    `  --station-pine: ${c('color.radio.ok')};`,
    `  --station-action: ${c('color.action.primary.bg')};`,
    `  --ce-font: ${tokens['font.family'].css};`,
    `  --ce-focus: 0 0 0 2px ${c('color.radio.bg')}, 0 0 0 4px ${c('color.radio.focus')};`,
    '}',
    '/* The Christmas look, applied by CE Radio only while a Christmas playlist is confirmed playing. */',
    '.ce-player.is-christmas {',
    `  --station-bg: ${c('color.radio.navidad.bg')};`,
    `  --station-surface: ${c('color.radio.navidad.surface')};`,
    `  --station-raised: ${c('color.radio.navidad.raised')};`,
    `  --station-line: ${c('color.radio.navidad.line')};`,
    `  --station-pine: ${c('color.radio.navidad.pine')};`,
    `  --xmas-accent: ${c('color.radio.navidad.accent')};`,
    `  --xmas-flake: ${c('color.radio.navidad.snow')};`,
    '}',
    '',
  ].join('\n');
}
