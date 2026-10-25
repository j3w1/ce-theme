# Coverage and status

What the Casa Elida foundation covers at 0.2.0, how each pattern from the retail reference maps to a recipe, and what is still open. Statuses are deliberately conservative.

| Status | Meaning |
| --- | --- |
| **Tested** | Recipe and runnable example exist, and a unit or browser test asserts the behaviour (every listed page also runs axe for WCAG 2.2 A/AA). |
| **Implemented** | Recipe and runnable example exist and were reviewed at 390 px and 1440 px; no dedicated assertion beyond the page-level axe and overflow checks. |
| **Specified** | Rules are written; no recipe yet. |
| **Needs input** | Waiting for a Casa Elida rule, data source or decision. |
| **Excluded** | Not adopted for Casa Elida. |

Examples: storefront `/tienda/` (home, `categoria`, `producto`, `escena`, `carrito`, `cuenta`), internal tools `/sistemas/`, labels `/sistemas/etiquetas/`, share previews `/compartir/`, recipe pages `/componentes/` and `/patrones/`. Run `pnpm dev`.

## Foundations

| Pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| Colour, type, spacing, radius, layers, control and row sizes | `tokens/`, `exports/tokens.css` | Tested | Contrast pairs in `ce-theme.json` are validated. Brand red with white is 4.33:1, so small white text uses action red. |
| Inter 400/600/700/800 | `recipes/fonts.css`, `fonts/inter/` | Tested | Hashes checked. Arial fallback. |
| Density: touch, comfortable, compact | `data-ce-density` | Tested | Compact rows stay ≥ 40 px. |
| Focus, reduced motion, larger text | All recipes | Tested | Focus ring is light-on-dark over photography and the black utility bar. |
| Campaign colours without changing tokens | `--ce-campaign-surface`, `--ce-campaign-text`, `campaignColors()` | Tested | `campaignColors` reports the contrast ratio and the minimum it must meet. |

## Shared elements and forms

| Pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| Buttons, icon buttons, links, chips | `ce-button`, `ce-icon-button`, `ce-link`, `ce-chip` | Tested | `ce-icon-button--action` for add-to-bag, `--small` for 40 px card actions. |
| Fields, validation, select | `ce-field`, `ce-input`, `ce-select` | Tested | |
| Checkbox, switch, fieldset, input with prefix, quantity, upload, tokens, combobox list | `interface.css` | Implemented | Combobox needs the application's filtering and `aria-activedescendant` handling. |
| Breadcrumbs, tabs, disclosure | `ce-breadcrumbs`, `ce-tabs`, `ce-disclosure` | Tested | Tabs follow the arrow-key pattern in `behaviors.mjs`. |
| Dialog, drawer, menu, tooltip | `<dialog>`, `popover` | Tested | Dialogs return focus to the control that opened them. Menu and tooltip positioning is left to the application. |
| Notices, toast, spinner, skeleton, empty state, progress, save state | `interface.css` | Implemented | |
| Status pills and availability | `ce-pill`, `ce-status`, `ce-stock` | Implemented | Always text plus colour. |
| Icons | `site/data/icons.mjs` (30 outlined icons) | Implemented | Social platforms are text links, not their marks. |

## Retail navigation and discovery

| Reference pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| Skip links, including “skip list” before rails | `ce-skip` | Tested | |
| Black utility bar with store and delivery context | `ce-utility-bar`, `ce-store-context` | Tested | Store choice dialog with `ce-choice-card`. |
| Header: logo, primary links, pill search, account, favourites, bag count | `ce-site-header`, `ce-site-nav`, `ce-search`, `ce-site-action`, `ce-count` | Tested | Mobile: icons in the first row, full-width search below, menu in a start-side drawer. Search suggestions are not implemented. |
| Mega-menu panels | — | Specified | Use the drawer list (`ce-nav-list`) on all widths until the category tree is defined. **Needs input:** category hierarchy. |
| Category pills with thumbnails | `ce-category-rail`, `ce-category-link` | Implemented | |
| Category tiles on subtle ground | `ce-category-tiles`, `ce-category-tile` | Implemented | |
| Hero mosaic: one large, one wide, two small, 12 px gaps | `ce-mosaic`, `ce-tile` (`--light`, `--wide`, `--tall`) | Implemented | Light tiles use catalogue cut-outs on brand grounds because no approved lifestyle photography was supplied. |
| Split promotion: photo two thirds, colour panel one third | `ce-split-promo` | Implemented | Panel defaults to action red; set campaign colours per campaign. |
| Colour-block content cards | `ce-block-card` | Implemented | |
| Image cards with label row; pill-label cards | `ce-card-link`, `ce-pill-card` | Implemented | |
| Peeking carousels with track and prev/next | `ce-rail`, `ce-rail-buttons`, `enhanceRails` | Tested | Native scroll container; buttons are an enhancement. |
| Statement banner | `ce-statement` | Implemented | |
| Price-point circles | `ce-price-points`, `ce-price-point` | Implemented | Amounts are supplied commercial terms. |
| Social gallery | `ce-social-grid`, `ce-social-item` | Specified | **Needs input:** approved social images without account chrome. |
| Footer with link groups, legal row | `ce-site-footer`, `ce-footer-grid`, `ce-footer-legal` | Implemented | Payment-logo row omitted until the accepted methods and their logo licences are known. |
| Feedback prompt, notice bands | `ce-feedback`, `ce-band` | Implemented | |

## Product presentation

| Pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| NAME / Description / specs | `ce-product-name`, `ce-product-description`, `ce-product-specs`, `productView` | Tested | Unit tests for casing rules. |
| CE code badge with on-screen number underline | `ce-code`, `codeSegments` | Tested | Underline removed in print; copying returns the exact code. |
| Product card: flag, favourite, add-to-bag, availability, more options, compare | `ce-product` plus `ce-product-flag`, `ce-product-row`, `ce-stock`, `ce-variant-thumbs`, `ce-product-select` | Tested | Ratings and review counts are not shown: no review data exists. |
| Prices: baseline S/, raised variant, yellow offer, red sale, unit price | `ce-price`, `preparePrice` | Tested | |
| Store-aware price states | `ce-store-note`, `ce-price-pending`, per-store views | Tested | No store, price unavailable, store switch without stale amounts. Loading state styled (`aria-busy`) but not exercised. |
| Quantity prices | `ce-tiers`; label `ce-label-bulk` | Implemented | **Needs input:** the quantity-price rule and its source in CE Systems. |
| Listing: quick filters, result count, active filters, sidebar or drawer, sort | `ce-filter-bar`, `ce-filter-chips`, `ce-result-count`, `ce-active-filters`, `ce-listing`, `ce-listing-aside` | Tested | Columns 2 / 3 / 3 + sidebar / 4 + sidebar. Filter facets and counts come from the search service. |
| In-grid promotion | `ce-grid-promo` | Implemented | |
| Load more with progress | `ce-load-more`, `ce-progress` | Implemented | Keep a crawlable next-page link in the application. |
| Product detail: gallery, buy box, variants, quantity, fulfilment, facts, disclosures | `ce-pdp`, `ce-gallery`, `ce-buy-box`, `ce-variant-picker`, `ce-quantity`, `ce-fulfilment`, `ce-facts` | Tested | Missing care information is stated, not invented. |
| Shoppable scene with A, B, C markers and accessible list | `ce-scene`, `ce-tagged-media`, `ce-hotspot`, `ce-tag-list`, `enhanceMarkers` | Tested | Markers can be hidden; the list remains. Marker positions are supplied data. |
| Collage of scene photos | `ce-collage` | Specified | Recipe present; no approved lifestyle set to demonstrate. |
| Feature tags and detail insets on photos | `ce-feature-tag`, `ce-detail-inset` | Implemented | |
| Comparison table | — | Specified | Compare selection exists; the comparison view needs the attribute model. |
| Reviews and ratings | — | Excluded | No review data or moderation process. |

## Customer journeys

| Pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| Bag with lines, quantity, remove, summary | `ce-cart`, `ce-cart-line`, `ce-order-summary`, `ce-summary` | Implemented | Amounts are supplied by the commerce service; the interface never totals them. |
| Checkout steps and fulfilment choice | `ce-steps`, `ce-choice-cards` | Implemented | **Needs input:** delivery coverage, costs, payment methods and their providers. |
| Favourites | `aria-pressed` heart, favourites section | Implemented | Persistence belongs to the account service. |
| Sign in / create account | `ce-auth`, `ce-divider` | Implemented | **Needs input:** identity provider, password rules, social sign-in. |
| Order tracking | `ce-timeline` | Implemented | **Needs input:** the order status vocabulary. |
| Store locator | `ce-locator`, `ce-location`, `ce-map-slot` | Implemented | **Needs input:** confirmed addresses, hours and the map provider. |
| Help and service links, FAQ | `ce-link-rows`, `ce-disclosure` | Implemented | |
| Returns, complaints book | Link rows | Specified | **Needs input:** returns policy and the complaints-book (Libro de Reclamaciones) process. |
| Gift cards, financing, loyalty pricing, assembly services, second-hand | — | Excluded | Not Casa Elida services today. |

## Internal workspaces (CE Systems, CE Meta, CE Radio)

| Pattern | Recipe | Status | Notes |
| --- | --- | --- | --- |
| App shell, module navigation, context switcher | `ce-app`, `ce-app-bar`, `ce-module-nav`, `ce-app-context` | Implemented | Collapses to a top scrolling nav below 1024 px. |
| Data table: sort, select, sticky header, numbers, bulk bar | `ce-data-table`, `ce-sort`, `ce-bulk-bar`, `ce-table-footer` | Tested | Sorting and selection state come from the application. |
| Record header, editor sections, read-only and locked fields, save state, audit | `ce-record-*`, `ce-form-*`, `ce-readonly`, `ce-locked`, `ce-save-state`, `ce-audit` | Tested | Locked code field explains that `1688toPL` allocates codes. |
| Permissions-aware presentation | `ce-locked`, `ce-pill`, disabled menu items | Implemented | Presentation only; the service enforces permissions. **Needs input:** role model. |
| Store price matrix | `ce-data-table` | Implemented | Read-only view of the pricing service. |
| Receiving with differences | `data-ce-density="touch"`, `ce-notice`, numeric inputs | Implemented | **Needs input:** receiving workflow and tolerance rules. |
| Point of sale | `ce-pos` | Specified | Recipe present; not demonstrated. **Needs input:** POS scope. |
| Compare versions | `ce-compare` | Specified | |
| Dashboards and charts | — | Specified | Follow the dataviz rules of the consuming tool; no chart recipes here. |
| HR, finance, approvals | — | Needs input | No business contracts supplied. |

## Cross-channel outputs

| Output | Recipe | Status | Notes |
| --- | --- | --- | --- |
| Share image 1200 × 630, product / text / category / brand | `exports/share-card.css` | Tested | No prices; text inside the canvas; quarter-scale previews reviewed. Rendering service not built. |
| Share metadata contract | [sharing.md](sharing.md) | Specified | |
| Gondola label 80 × 40 mm and A4 sheet | `exports/print-label.css` | Tested | Size and containment tested in the browser. **Not verified:** physical printer, paper and QR scanning. |
| Product barcode label 40 × 20 mm, carton mark | `1688toPL` | Excluded | Owned by `1688toPL`; unchanged. |
| Social posts and stories | `ce-photo-panel`, `ce-callout` | Implemented | |
| Vuetify / Vuexy adapter | `exports/adapters/vuetify.mjs` | Implemented | Theme and defaults only; not tested inside a Vuexy application. |
| Claude Design system | `exports/design-system/` | Implemented | Synced copy for visual exploration. |

## Accessibility notes from the reference

The reference had issues this foundation avoids by construction: real buttons instead of clickable `div`s, no rating buttons that add tab stops, tabs with `aria-controls` and labelled panels, unique ids per store view, and no screen text below 12 px. Text on brand red stays large; small text uses action red (4.74:1). The storefront home keeps a visually hidden h1 because its first visual element is the mosaic; content pages show their h1.
