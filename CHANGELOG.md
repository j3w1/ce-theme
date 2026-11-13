# Changelog

## @casaelida/vue 0.2.0 — 2026-11-12 (unreleased)

SEAL #7 batch B1 (ce-theme#8).

### Added

- `@casaelida/vue/styles.css`: Inter `@font-face` with the four Inter WOFF2 files and `OFL.txt` inside the package, the tokens and the recipes, built by `scripts/package.mjs` from `tokens/`, `recipes/` and `fonts/` into the ignored `dist/`. `sideEffects` names it, so bundlers keep the import. A `NOTICE` says the Casa Elida name, logo and brand assets are not licensed by the package.
- `pnpm test:consumer` (`tests/consumer/`): the clean install proof. The packed file, checked against an expected file list and its sources, is installed into an empty Vite + Vue + TypeScript app outside the checkout with a fresh pnpm store and no user configuration; it checks the lockfile integrity, a single Vue resolved as the peer, a strict typecheck, the build and a browser test of the built output. CI runs it as its own job.
- A standalone browser test of the collapse of `CEAttachmentGroup` and `CEWorkStatus` in shrink-to-fit parents and of the definite-width fix (#5), with the rule and examples in the package README, `docs/apply-ce-theme.md` and the names registry.

### Changed

- The package and the foundation share one version, 0.2.0. Installation, upgrade and rollback by one pinned package file are documented in the package README and `docs/apply-ce-theme.md`.
- Browser tests use their own port and never an existing server. CI installs and runs Chromium and WebKit; a local run says WebKit was not run.
- `docs/decisions.md` records the SEAL #7 revisions of “Workflow”, “Delivery”, “Application identities” and “Showcase exception”, and three Step 4B decisions; `AGENTS.md`, `docs/workflow.md` and `packages/vue/CONTRIBUTING.md` follow them.

### Fixed (found by the new WebKit project; scope decision by j3w1)

- `CEMessageList` keeps a reader who is at the newest message there in WebKit when content inside a message re-renders. WebKit lays the change out in a shorter intermediate state and clamps the scroll position while every size ends as it was; a mutation observer puts a following reader back before the scroll is reported. A reader in history is still never moved.
- `/mensajeria/`: in WebKit, a composing reader again moves to the thread view when the window narrows or the text grows. The example reads “narrow” from its panes grid instead of the Back button, whose container-query style WebKit leaves stale inside the hidden thread pane.

## Unreleased — 2026-10-30 (pending owner review)

### Added

- `@casaelida/vue` (`packages/vue`), the first importable Vue 3 + TypeScript package: `CEButton`, `CETextField`, `CEPrice`, `CEProductCode`, with unit tests and a test that they emit only recipe classes. Built with Vite; types from `vue-tsc`.
- Component naming convention: `CE` + PascalCase, enforced by `tests/vue-naming.test.mjs`; the names registry gains a `vue` field.
- Type declarations for `recipes/price.mjs` and `recipes/product.mjs`.
- `docs/workflow.md` and the branch reconciliation record (`docs/evolution/2026-10-reconciliation.md`).
- Messaging foundation for CE Meta App: recipes in `recipes/messaging.css` and the public components `CEConversationList`, `CEMessageList` and `CEMessageComposer` (typed `submitReply` and `saveNote` events, separate reply and note drafts, delivery states in words). Standard names group Mensajería.
- `/mensajeria/`: one interactive example in the showcase (a specific owner-approved exception to the rule against new showcase pages), built from the real components on fictional in-memory fixtures. It says "Simulación: ningún mensaje sale de esta página." and sends nothing.
- Step 4B (ce-theme#3): `CEAttachmentGroup` (already-sent images, uncropped by default, `open(index, id)`) and `CEWorkStatus` (application-supplied steps and state in words and shape, an `actions` slot, a polite announcement when the state changes). `CEMessageList` gains message `attachments`, an `openAttachment` event and a `context` slot; its keyed scrolling contract also holds while attachments or contextual content change height. Recipes `ce-attachments`, `ce-work-status` and `ce-message-context`; standard names AttachmentGroup and WorkStatus. `CEAttachmentGroup` and `CEWorkStatus` are their own query containers (`ce-attachment-group`), so they respond to a narrow width standalone; `ce-message-list` is not a container, so existing message lists keep their intrinsic width.
- `/mensajeria/`: the fictional conversation “Reposición · Tacna” with a fictional SVG shelf illustration (`public/references/shelf-gap-fictional.svg`, provenance recorded), delivery status shown apart from replenishment progress, simulated warehouse actions (Solicitado → Aceptado → Preparando → Resuelto, or No se puede atender) and a visible simulated attachment-open event. The states are illustrative, not CE Systems rules.
- Tests for the messaging components, the example (keyboard, focus, 320 to 1440 px, enlarged text, accessibility, no network or storage) and the design-system title.

### Changed

- `design-system/README.md`: product prices follow the specifications at the approved 12px gap instead of aligning to the bottom of cards; the standard names are ten cards, including Messaging; the Components listing includes the Controls card.
- The Astro site is the documentation and showcase only. It renders the real components: every price through `site/components/Price.astro`, and the button, field and code demonstrations.
- Prices no longer carry the unused `ce-price--regular` class.
- `pnpm check` also typechecks, tests and builds the Vue package; `pnpm dev` and `pnpm build` build it first.
- The Vuetify adapter is labelled legacy.
- The Claude Design System is named “CE Theme — Design System” from one field, `designSystemName` in `ce-theme.json`; the generator no longer reuses the brand name for it.
- CE Meta is described as the internal administration and control platform and CE Meta App as the messaging app; the design-system README, the `/sistemas/` navigation and the decision records say so.
- The showcase has its first client-side island (the `/mensajeria/` example); every other page is still static HTML.

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
