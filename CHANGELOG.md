# Changelog

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
- `CLAUDE.md` as a symbolic link to `AGENTS.md`.
- CE Radio as a ce-theme application: the `logo-ce-radio.png` and `logo-ce-radio-navidad.png` badges and four design-system cards captured from the restyled app.
- Validation: reference-only manifest, component-input allow-list, a guard against naming the external retail reference, stale-file guard for downloads.

### Not changed

`j3w1/1688toPL` (codes, barcode labels, carton marks) and every downstream application.
