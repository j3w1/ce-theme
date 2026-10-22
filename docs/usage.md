# Consuming the Casa Elida foundation

## Stable entry points

Version: **0.1.0**, light foundation. `ce-theme.json` lists the source token files, generated exports, and tested contrast pairs. Pin a release or commit when adopting the foundation; do not silently follow a changing branch.

- `exports/tokens.css`: resolved CSS custom properties, prefixed `--ce-`.
- `exports/tokens.resolved.json`: token type, resolved value, CSS value, description, and variable name.
- `exports/recipes.css`: opt-in, framework-neutral HTML recipes.
- `recipes/price.mjs`: `formatAmount`, `amountInCents`, and `preparePrice` named exports.

The static site exposes the same files under `/downloads/`. DTCG sources remain in `tokens/`; the resolved export is a consumer convenience, not a second authoring format.

## CSS and typography

Load tokens first, recipes second, then application styles. Wrap a consumer region in `ce-scope`. Its box-sizing rule is local to the wrapper; the recipes never reset global HTML elements.

```html
<link rel="stylesheet" href="/styles/tokens.css">
<link rel="stylesheet" href="/styles/recipes.css">
<section class="ce-scope">
  <button class="ce-button">Ver productos</button>
</section>
```

The reference site bundles and self-hosts `@fontsource-variable/noto-sans`, pinned in the lockfile. A bundler consumer can install that package and import `@fontsource-variable/noto-sans` in its application entry. Keep the font's OFL notice. Copy-only consumers may use the documented Arial/sans-serif fallback or host their licensed Noto Sans font files. The recipes themselves do not fetch fonts or any third-party URL.

Typography uses weights 400, 600, 700, and 800. Body text is 16px, supporting product details and codes 14px, and line-height 1.5. Large display prices use weight 800. The currency prefix is 46% of the amount size; fractional digits retain the amount's size.

## HTML recipes

The reference site's component pages contain copyable, visible markup examples. Use native buttons, links, inputs, and selects. A style class does not implement an application action: wire events, validation, navigation, and commerce behavior in the consumer.

- Buttons: `ce-button`, `ce-button--secondary`, `ce-button--ink`.
- Icon actions: `ce-icon-button` plus an accessible name; hide decorative SVGs from assistive technology.
- Choices: `ce-chip` and `ce-swatch`; use `aria-pressed` on toggle buttons, `aria-current` on navigation links, and implement the matching behavior.
- Fields: `ce-field`, `ce-input`, `ce-select`, `ce-field-note`, `ce-field-error`. Associate labels and descriptions; invalid fields use `aria-invalid`.
- Identifiers: `ce-code`. Render the original string as text, never as HTML or a number.
- Product cards: `ce-product`, `ce-product-media`, `ce-product-info`, `ce-product-model`, `ce-product-name`, `ce-product-details`, and the price recipe.
- Floating information: `ce-callout`. Product photography uses `object-fit: contain`.
- Photographic compositions: `ce-photo-panel`, `ce-photo-content`, and the inverse price. Position essential content inside an 8% safety margin; story headers use 10%.

Product cards have no fixed height. The information area flexes and pushes prices to the bottom. Product grids use two columns below 640px, three from 640px, and four from 1024px. Add the actual product code above the name when the consumer supplies one; catalogue aliases such as MENE are independent labels.

For photo compositions the recipe places a dark gradient behind the text. The gradient is a starting point, not a guarantee of contrast for every image. Validate the final crop and text placement. Code and price text must remain live HTML on web surfaces.

## Price API

```js
import { preparePrice } from './price.mjs';

const view = preparePrice({
  amount: '14.50',
  previousAmount: '16.50',
  variant: 'offer',
});
// { current: '14.5', previous: '16.5', variant: 'offer', ... }
```

Inputs are decimal strings with at most two decimal places. The result removes unnecessary trailing zeros: `'20.00'` becomes `'20'`, `'8.50'` becomes `'8.5'`. Exponents, negative values, numeric inputs, and extra precision are rejected. The display uses `S/` and a decimal point without grouping, matching the supplied references.

`previousAmount`, when present, must exceed `amount`. `discountLabel` is optional supplied text such as `'31.25%'`, without a leading sign; the visual recipe adds the minus sign once. A discount label requires a previous price. `unitLabel` is optional text such as `'cada uno'`. The formatter validates but never computes a discount, tax, currency conversion, or selling policy.

The style defaults to `offer` when a previous price is supplied, otherwise `regular`. Explicit variants are `regular`, `offer`, and `inverse`. An offer may omit the previous price when the consumer's supplied campaign does not include one. The formatter does not authorize an offer.

At render time, use DOM text or framework-escaped text. Give the price a visually hidden text label, for example `Precio actual: 8.5 soles, cada uno`; hide fragmented decorative numeral spans from screen readers. Keep the previous price in a separate readable `Antes` + `del` element.

## Brand-wide adoption

The shared semantic roles cover brand, surfaces, text, actions, control boundaries, prices, identifiers, focus, and statuses. Internal tools use the same typography and neutral surfaces; status colors retain their meaning independently from the red brand color. Campaigns and signage scale the same hierarchy for distance and format. Validate final signage on its actual display.

This version supplies light tokens and CSS/HTML recipes. It does not replace Vuexy/Vuetify, introduce a JavaScript component framework, or automatically change any downstream application. Integrate through each consumer's own design and review process.
