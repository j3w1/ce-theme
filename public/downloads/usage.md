# Consuming the Casa Elida foundation

Start with [apply-ce-theme.md](apply-ce-theme.md) for the load order and the rules that always apply. This page lists the entry points and APIs.

## Stable entry points

Version: **0.2.0**, light foundation. `ce-theme.json` lists the token sources, generated exports and tested contrast pairs. Pin a release or commit; do not silently follow a changing branch. Breaking changes from 0.1.0 are in [CHANGELOG.md](../CHANGELOG.md).

| File | Contents |
| --- | --- |
| `exports/tokens.css` | Resolved CSS custom properties, prefixed `--ce-`. |
| `exports/tokens.resolved.json` | Token type, resolved value, CSS value, description and variable name. |
| `exports/fonts.css` | Optional `@font-face` rules for the self-hosted Inter files in `fonts/inter/`. |
| `exports/recipes.css` | Framework-neutral recipes: base, interface, retail and workspace (`recipes/recipes.css`, `interface.css`, `retail.css`, `workspace.css`). |
| `exports/share-card.css` | 1200 × 630 server-rendered share image. |
| `exports/print-label.css` | 80 × 40 mm gondola label and A4 sheet. |
| `exports/adapters/vuetify.mjs` | Vuetify/Vuexy theme and component defaults. |
| `recipes/price.mjs` | `formatAmount`, `amountInCents`, `preparePrice`. |
| `recipes/product.mjs` | `formatName`, `formatDescription`, `formatSpec`, `codeSegments`, `productView`. |
| `recipes/campaign.mjs` | `contrastRatio`, `campaignColors`. |
| `recipes/behaviors.mjs` | Optional progressive-enhancement behaviour for tabs, dialogs, quantity, choices, copy, toggles, rails, gallery and marker visibility. |

The static site exposes the same files under `/downloads/`. DTCG sources remain in `tokens/`; the resolved export is a consumer convenience, not a second authoring format.

## CSS and typography

Load fonts (optional), tokens, recipes, then application styles. Wrap a consumer region in `ce-scope`. Its box-sizing rule is local to the wrapper; the recipes never reset global HTML elements.

```html
<link rel="stylesheet" href="/styles/fonts.css">
<link rel="stylesheet" href="/styles/tokens.css">
<link rel="stylesheet" href="/styles/recipes.css">
<section class="ce-scope">
  <button class="ce-button">Ver productos</button>
</section>
```

The typeface is Inter (3.015, weights 400/600/700/800, WOFF2, OFL) in `fonts/inter/`. `exports/fonts.css` uses URLs relative to `../fonts/inter/`; copy the folder beside it or point the URLs at your own copy, and keep the OFL notice with the files. Without the font, the stack falls back to Arial and sans-serif. Subsetting to the Latin range is permitted by the OFL; record a subset as a derived file with its own hash.

## Recipes

Use native elements: buttons, links, inputs, selects, `<details>`, `<dialog>` and the `popover` attribute. A class never implements an application action; wire events, validation, navigation and commerce in the consumer. The reference site shows runnable markup for every recipe, and [coverage.md](coverage.md) lists each class with its status.

- **Identity:** `ce-product-heading` with `ce-product-name` (NAME) and `ce-product-description`, then `ce-product-specs`. Set `--ce-product-text` to scale all three. Format through `productView`.
- **Codes:** `ce-code`, optionally segmented with `codeSegments` and `ce-code-number`. Render the original string as text, never as a number.
- **Prices:** the price recipe below; `ce-price--raised` for the raised `S/`, `ce-price--offer` (yellow, default promotion), `ce-price--sale` (red).
- **Retail:** `ce-site-header`, `ce-store-context`, `ce-category-rail`, `ce-mosaic`, `ce-tile`, `ce-rail`, `ce-filter-bar`, `ce-listing`, `ce-product-grid--divided`, `ce-pdp`, `ce-buy-box`, `ce-scene`, `ce-cart`, `ce-auth`, `ce-timeline`, `ce-site-footer`.
- **Interface:** `ce-tabs`, `ce-disclosure`, `ce-dialog`, `ce-drawer`, `ce-menu`, `ce-tooltip`, `ce-notice`, `ce-toast`, `ce-empty`, `ce-skeleton`, form controls.
- **Workspace:** `data-ce-density`, `ce-app`, `ce-data-table`, `ce-bulk-bar`, `ce-record-header`, `ce-form-section`, `ce-locked`, `ce-audit`.
- **Photography:** `ce-photo-panel`, `ce-tagged-media` with `ce-hotspot` markers (`A`, `B`, `C`), `ce-feature-tag`, `ce-tag-list`. Position with `--ce-x` and `--ce-y`.

Component inputs are custom properties prefixed `--ce-`: `--ce-x`, `--ce-y`, `--ce-line`, `--ce-size`, `--ce-product-text`, `--ce-campaign-surface`, `--ce-campaign-text`, `--ce-columns`, `--ce-control`, `--ce-row`, `--ce-cell-pad`.

Product cards have no fixed height; the information area pushes prices to the bottom so price rows align. Photo text uses a dark gradient that is a starting point, not a contrast guarantee: validate the final crop. Codes and prices remain live HTML on web surfaces.

## Price API

```js
import { preparePrice } from './price.mjs';

const view = preparePrice({ amount: '14.50', previousAmount: '16.50', discountLabel: '12.12%' });
// { current: '14.5', previous: '16.5', discountLabel: '12.12%', variant: 'offer', ... }
```

Inputs are decimal strings with at most two decimal places. The result drops unnecessary trailing zeros: `'20.00'` → `'20'`, `'8.50'` → `'8.5'`. Exponents, negatives, numeric inputs and extra precision are rejected. Display uses `S/` and a decimal point without grouping.

`previousAmount`, when present, must exceed `amount`. `discountLabel` is optional supplied text such as `'31.25%'`, without a sign; the recipe adds the minus once, and it requires a previous price. `unitLabel` is optional text such as `'cada uno'`. The formatter validates but never computes a discount, tax, conversion or selling policy. Variants: `regular`, `offer` (default when a previous price is supplied), `sale`, `inverse`.

Give the price visually hidden text, for example `Precio actual: 8.5 soles, cada uno`, and hide the decorative numeral spans from screen readers. Keep the previous price in a separate `Antes` + `del` element.

## Product API

```js
import { productView } from './product.mjs';

productView({ code: 'CE26061441', name: 'mene', description: 'taza de vidrio resistente al calor', specs: ['Vidrio borosilicato', '250ML'] });
// { name: 'MENE', description: 'Taza de Vidrio Resistente al Calor', specs: ['vidrio borosilicato', '250ml'], code: 'CE26061441', ... }
```

`productView` formats supplied fields and throws on a numeric code or a record with neither NAME nor Description. It never fills missing fields. See [product identity](product-identity.md) for the rules.

## Brand-wide adoption

Internal tools use the same typography and neutral surfaces with compact density; status colours keep their meaning apart from the brand red. Campaigns and signage scale the same hierarchy for distance and format; validate signage on its display and labels on the real printer. The Vuetify adapter maps the palette and defaults for Vuexy applications; it does not replace their components. This version does not change any downstream application.
