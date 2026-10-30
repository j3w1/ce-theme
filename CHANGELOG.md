# Changelog

## Unreleased — 2026-10-30 (pending owner review)

### Added

- `@casaelida/vue` (`packages/vue`), the first importable Vue 3 + TypeScript package: `CEButton`, `CETextField`, `CEPrice`, `CEProductCode`, with unit tests and a test that they emit only recipe classes. Built with Vite; types from `vue-tsc`.
- Component naming convention: `CE` + PascalCase, enforced by `tests/vue-naming.test.mjs`; the names registry gains a `vue` field.
- Type declarations for `recipes/price.mjs` and `recipes/product.mjs`.
- `docs/workflow.md` and the branch reconciliation record (`docs/evolution/2026-10-reconciliation.md`).

### Changed

- The Astro site is the documentation and showcase only. It renders the real components: every price through `site/components/Price.astro`, and the button, field and code demonstrations.
- Prices no longer carry the unused `ce-price--regular` class.
- `pnpm check` also typechecks, tests and builds the Vue package; `pnpm dev` and `pnpm build` build it first.
- The Vuetify adapter is labelled legacy.

## 0.2.0 — 2026-10-23 (owner review, unreleased)

Locked product identity, retail and enterprise recipes, labels, price-free share previews. Decisions are recorded in [docs/decisions.md](docs/decisions.md); status per pattern in [docs/coverage.md](docs/coverage.md).

### Breaking changes

| 0.1.0 | 0.2.0 |
| --- | --- |
| `ce-product-model` (MENE) + `ce-product-name` (description) + `ce-product-details` | `ce-product-heading` with `ce-product-name` (uppercase NAME) and `ce-product-description` (Title Case), then `ce-product-specs`. Use `productView`. |
| `--x`, `--y`, `--line`, `--size` | `--ce-x`, `--ce-y`, `--ce-line`, `--ce-size` |
| Red ringed markers `A.`, `B.`, `C.`; `ce-hotspot--promo` | Black markers `A`, `B`, `C` (marker tokens), separate focus ring; promo marker removed. |
| `S/` raised by default | `S/` on the baseline; `ce-price--raised` for the raised variant. |
| Square code badge | `ce-code` with 0.3em × 0.35em padding and 0.2em radius; optional `ce-code-number` underline on screen. |
| `.ce-campaign` defaults to brand red | Defaults to action red (small white text passes AA); set `--ce-campaign-surface` per campaign. |
| Share card with price, red strip and code column | Price-free `ce-share-card` with product, text, photo, category and brand variants. |
| `public/assets/logo.png`, `logo-brand.jpg` | `logo-wordmark-color.png`, `logo-square-red.jpg` (plus seven supplied variants). |
| `public/assets/campaign-*.jpg` | Moved to `public/references/` (reference-only). |
| Design-system asset group `Campaigns` | `References`. |

### Added

- Tokens: `radius.code`, `font.ratio.name`, `size.control.*`, `size.row.*`, `layer.*`, `color.marker.*`, `color.sale.*` and three contrast pairs.
- Recipes: `interface.css` (navigation, overlays, feedback, forms), `retail.css` (header, store context, category navigation, mosaics, rails, listing and filters, product detail, scenes, cart, account, footer), `workspace.css` (density, app shell, data tables, editors, audit, POS), `print-label.css` (80 × 40 mm label, A4 sheet).
- Helpers: `product.mjs`, `campaign.mjs`, `behaviors.mjs`; `sale` price variant.
- `exports/adapters/vuetify.mjs`.
- Reference site: storefront `/tienda/`, internal tools `/sistemas/`, label sheet `/sistemas/etiquetas/`, share previews `/compartir/`.
- Docs: `apply-ce-theme.md`, `product-identity.md`, `coverage.md`, `sources.md`; pricing store states; sharing rewritten.
- Native control styling policy ([docs/controls.md](docs/controls.md)): inventory of every HTML control with its recipe, states, keyboard and intentional native fallbacks; new `ce-textarea`, `ce-radio`, `ce-range`, `ce-color`, `ce-meter`, `ce-media`, date, time and file styling and a `base-select` customizable select; a browser test that fails on an unstyled control.
- Hover pins for photo tagging on the web (`ce-pin`, `enhancePins`): a dot opens a card with NAME, Description, price and a chevron link; the lettered markers stay for static media. New registry names `ProductPin` and `ProductPinCard`.
- Share previews read like the gondola label (bold Description, semibold specs, code in `ce-share-card-foot`), with a 240 px wordmark and every page type shown on `/compartir/` and in the `ShareCard` design-system card.
- `CLAUDE.md` as a symbolic link to `AGENTS.md`.
- CE Radio as a ce-theme application: the `logo-ce-radio.png` and `logo-ce-radio-navidad.png` badges and four design-system cards captured from the restyled app.
- Validation: reference-only manifest, component-input allow-list, a guard against naming the external retail reference, stale-file guard for downloads.

### Not changed

`j3w1/1688toPL` (codes, barcode labels, carton marks) and every downstream application.
