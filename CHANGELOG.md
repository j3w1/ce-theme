# Changelog

## @casaelida/vue 0.3.3 — 2026-11-14 (unreleased)

CR-05, the in-page store line (ce-theme#11). The packaged recipes gain the StoreBar rules; the components are unchanged. It follows 0.3.2 (CR-09) in the release order.

### Added

- The standard name `StoreBar` (Barra de tienda): the in-page store line is a `ce-store-note` whose action is a `ce-link`, with no class of its own. In `recipes/retail.css`, every `ce-link` inside a `ce-store-note` reaches `--ce-size-target-public` (44px), including a link inside a sentence, whose row grows to 44px. A pending bar (`aria-busy="true"`) shows the progress cursor. Its four states and wording are in the StoreContext guideline and card. Also added: a coverage row, the decision in `docs/decisions.md` and `tests/browser/store-bar.spec.mjs`.

### Changed

- The Cart card and the storefront cart name their store with the StoreBar («Importes en …»), and the storefront home, listing, product and scene pages gain it («Precios y disponibilidad de …», «Tienda: sin elegir»). The storefront cart's amounts are now per store, with no amount when no store is chosen; the home page's promotion tile shows its offer price only for the store that supplies it.

## @casaelida/vue 0.3.2 — 2026-11-14 (unreleased)

CR-09, the pin-card spacing and fit (ce-theme#11). The shipped `styles.css` changes, so the package takes a new version (the `placePins()` reference behaviour in `recipes/behaviors.mjs` changes too, but it is not in the package); it follows 0.3.0 (CR-01) and 0.3.1 (CR-10) in the release order. The decisions are the repository lead's selections, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed, with the fit as decision 3, decided under the same standing delegation (Supervisor confirmation, 2026-11-13 13:22), not j3w1-typed.

### Changed

- The pin card follows the ProductStack. NAME and Description are 2px apart (`size.product.gap-identity`, was 4px), and the price block, or the store note or pending-price message in its place, starts 8px under the Description from `size.product.gap-note` (the store note and pending-price message were 4px). Every card stays the width of its focus ring inside its photo's edges, so the ring is never clipped; with large text the card is never wider than its photo, and a card taller than its photo is limited to the photo's height by `placePins()` and scrolls instead of being clipped; `enhancePins()` places the cards again once the fonts have loaded. No markup, type scale, price or API change; `tests/browser/pin-card.spec.mjs` measures it, with text at x1, x1.5 and x2.

## @casaelida/vue 0.3.1 — 2026-11-13 (unreleased)

CR-10, the record title with product identity (ce-theme#11). The shipped `styles.css` changes, so the package takes a new version. Decisions 2 and 3 are the repository lead's selections, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; decision 4 is the lead's decision under the same standing delegation, not j3w1-typed.

### Changed

- `ce-record-title` in `recipes/workspace.css` (CR-10): a direct-child `ce-product-heading` sits 8px below the code or the row that holds it, and a direct-child `ce-product-specs` 2px below the heading, from the `size.product` and `space` tokens. The 4px grid gap stays, so a title without them is unchanged; no selector reaches an identity nested inside a heading.
- `ce-record-header` (CR-10): thumbnail, title and status share one wrapping line. The title is never narrower than its one-line code, and where the line has no room the status moves to the next line instead of covering the title. Markup and classes are unchanged.
- The RecordEditor sample draws the identity heading instead of a run-in title. The RecordEditor README, `docs/decisions.md`, `docs/coverage.md` and CR-10 record the rules; `tests/browser/record-title.spec.mjs` measures CR-10's acceptance (390, 768 and 1440 px at 100%, 150% and 200% text, in a page-wide title and in a record header).

## @casaelida/vue 0.3.0 — 2026-11-13 (unreleased)

CR-01, admin navigation (ce-theme#11). The shipped `styles.css` changes, so the package takes a new version. The decisions are the repository lead's selections, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed.

### Changed

- `ce-module-nav` links and `ce-app-brand` follow density with the public-target floor: `min-height: max(var(--ce-size-target-public), var(--ce-control, 0px))`. That is 44px with no density and in compact, and 56px in touch; before, the links were 40px at every density and the brand had no minimum. Every consumer's module links grow. The brand also raises `ce-app-bar` where it is the tallest item in the bar, for example a bar holding only the brand (56px before, 61px now and 73px in touch).
- Only `aria-current="page"` draws the current module link; any other value, including `"false"`, draws an ordinary link.
- Module group headings and links wrap inside the 240px column at larger text (`overflow-wrap: anywhere`), and a link's `svg` icon keeps its supplied size (`flex: none`).

### Added

- The AppShell card's seven-group, seventeen-link module example, using existing CE Theme icons, and the module navigation rules in its guideline. The application supplies its modules and their icons.
- `tests/browser/app-shell.spec.mjs` covers CR-01 acceptance 1 to 5 on the generated card. The screen-reader walk (acceptance 6) has not been run and is still to be scheduled.
- The CR-01 records: `docs/decisions.md` (with the rule for selections made under the #11 delegation), `docs/coverage.md`, the `ModuleNav` rule, CR-01 and `docs/workbench.md`.

## @casaelida/vue 0.2.1 — 2026-11-13 (`vue-v0.2.1`)

A patch for CR-06, the availability line (ce-theme#11): the packaged recipes name the availability states `unknown` and `pending`, with the same look, and the wording and accessible name are documented. The components are unchanged.

### Changed

- `ce-stock` (StockLine) names its documented states in the CSS: `unknown`, which an item with no `data-state` looks like, and `pending` keep the neutral dot, and `unavailable` stays the only ring. Nothing looks different.
- The wording contract is in the StockLine section of `docs/names.md`: «Disponibilidad por confirmar en {tienda}» for an unknown, stale, conflicting or missing reading, «Consultando disponibilidad…» while it is read, and «Pocas unidades» and «Agotado» only from a confirmed reading. With no store chosen there is no availability line. The list is named `aria-label="Disponibilidad"` in every sample and reference page.
- The ProductCard and StoreContext cards gain an unknown sample beside the confirmed ones; StoreContext also shows the pending state. `/tienda/producto/` shows a store note instead of an availability line when no store is chosen. `ce-availability` is unchanged.
- Tests: `tests/availability.test.mjs` (wording, accessible name, the canon fixtures, supplied readings) and `tests/browser/availability.spec.mjs` (the five states at three widths and three text sizes, the dots, forced colours and greyscale).

## @casaelida/vue 0.2.0 — 2026-11-13 (`vue-v0.2.0`)

SEAL #7 batch B1 (ce-theme#8). The release was built from `f2a808a`, so it also contains CR-03, the demonstration cue (ce-theme#11).

### Added

- `@casaelida/vue/styles.css`: Inter `@font-face` with the four Inter WOFF2 files and `OFL.txt` inside the package, the tokens and the recipes, built by `scripts/package.mjs` from `tokens/`, `recipes/` and `fonts/` into the ignored `dist/`. `sideEffects` names it, so bundlers keep the import. A `NOTICE` says the Casa Elida name, logo and brand assets are not licensed by the package.
- `pnpm test:consumer` (`tests/consumer/`): the clean install proof. The packed file, checked against an expected file list and its sources, is installed into an empty Vite + Vue + TypeScript app outside the checkout with a fresh pnpm store and no user configuration; it checks the lockfile integrity, a single Vue resolved as the peer, a strict typecheck, the build and a browser test of the built output. CI runs it on the one package file it packs (`--package`), and on the published release URL.
- The B1-release workflow (ce-theme#10). `.github/workflows/check.yml` checks every push and pull request and packs one package file. On `main` its `publish` job releases that file once as `casaelida-vue-X.Y.Z.tgz` on the immutable GitHub Release `vue-vX.Y.Z`, or verifies the release that exists (`scripts/release.mjs`, with tests for each release state); its `prove` job installs it from the public URL. The package README and `docs/apply-ce-theme.md` name the release URL and the Releases page.
- A standalone browser test of the collapse of `CEAttachmentGroup` and `CEWorkStatus` in shrink-to-fit parents and of the definite-width fix (#5), with the rule and examples in the package README, `docs/apply-ce-theme.md` and the names registry.

### Changed

- The package and the foundation share one version, 0.2.0. Installation, upgrade and rollback by one pinned package file are documented in the package README and `docs/apply-ce-theme.md`.
- Browser tests use their own port and never an existing server. CI installs and runs Chromium and WebKit; a local run says WebKit was not run.
- `docs/decisions.md` records the SEAL #7 revisions of “Workflow”, “Delivery”, “Application identities” and “Showcase exception”, and three Step 4B decisions; `AGENTS.md`, `docs/workflow.md` and `packages/vue/CONTRIBUTING.md` follow them.

### Fixed (found by the new WebKit project; scope decision by j3w1)

- `CEMessageList` keeps a reader who is at the newest message there in WebKit when content inside a message re-renders. WebKit lays the change out in a shorter intermediate state and clamps the scroll position while every size ends as it was. The list reads the position just before the first update of a render flush and puts a reader who was at the newest message back after it, before the clamp is reported as a scroll. A reader in history is still never moved.
- `/mensajeria/`: in WebKit, a composing reader again moves to the thread view when the window narrows or the text grows. The example reads “narrow” from its panes grid instead of the Back button, whose container-query style WebKit leaves stale inside the hidden thread pane.

### Added: demonstration cue (CR-03, ce-theme#11)

- `ce-demo-cue` in `recipes/interface.css`, the standard name `DemoCue` (Aviso de demostración) and its design-system card: one bordered block note from tokens, with the 2px border reusing `stroke.focus`. It holds no text; the consumer supplies the words and `role="note"`, and production output leaves it out. No Vue component.
- The usage rules in `docs/names.md` (“Demonstration cue”), `docs/apply-ce-theme.md`, `docs/usage.md` and `docs/coverage.md`, and the decision in `docs/decisions.md`.
- `tests/demo-cue.test.mjs` (no text and no raw colour in the recipe; canon wording in every example) and `tests/browser/demo-cue.spec.mjs` (390, 768 and 1440 px at 100%, 150% and 200% text; axe; reading order).

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
