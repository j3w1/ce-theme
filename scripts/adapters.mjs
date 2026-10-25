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
